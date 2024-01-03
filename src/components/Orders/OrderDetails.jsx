import React, {useEffect, useState, useCallback} from "react";
import tinh_tp from "../../Models/Address/tinh-tp.json";
import quan_huyen from "../../Models/Address/quan-huyen.json";
import xa_phuong from "../../Models/Address/xa-phuong.json";
import OrderProductDetail from "./OrderProductDetail";
import {fetchOrderDetail} from "../../services/Order/OrderDetail";
import {getLastId} from "../../services/Order/Order";
import {fetchCustomer} from "../../services/Customer/Customer";
import {fetchDiscountByCode, fetchDiscountCodeById} from "../../services/Discount/Discount";

export default function OrderDetails({visible, orderData, handleAddOrder, handleEditOrder, onClose, action}) {
    const [order, setOrder] = useState(() => {
        return {
            id: "",
            customerEmail: "",
            name: "",
            address: "",
            phone: "",
            discountId: "",
            shippingFee: "",
            totalPrice: "",
            note: "",
            orderDate: new Date().toISOString().split('T')[0],
            cancelDate: "",
            completeDate: "",
            deliveryType: "Standard",
            paymentType: "Credit Card",
            status: "Processing",
            city: "Thành phố Hồ Chí Minh",
            district: "Quận 1",
            ward: "Phường Tân Định",
            cityCode: 79,
            districtCode: 760,
        }
    });
    const [visibleOrderProductDetail, setVisibleOrderProductDetail] = useState(false);
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderDetail, setOrderDetail] = useState({});
    const [orderProductChanged, setOrderProductChanged] = useState(false);

    const [cities, setCities] = useState(tinh_tp);
    const [districts, setDistricts] = useState(quan_huyen);
    const [wards, setWards] = useState(xa_phuong);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [isValid, setIsValid] = useState({
        email: false,
        name: false,
        address: false,
        phone: false,
        newEmail: true,
        newName: true,
        newAddress: true,
        newPhone: true,
    });

    useEffect(() => {
        if (action === "add") {
            getLastId().then((res) => {
                setOrder((prevOrder) => ({
                    ...prevOrder,
                    id: res + 1,
                }));
            });

            setIsValid({
                email: false,
                name: false,
                address: false,
                phone: false,
                newEmail: true,
                newName: true,
                newAddress: true,
                newPhone: true,
            });
        } else {
            const getDiscountCode = async () => {
                const DiscountCode = await fetchDiscountCodeById(orderData.discountId);
                setOrder((prevOrder) => {
                    const newCity = cities.find((tinh) => tinh.name === orderData.city);
                    const newDistrict = districts.find((quan) => quan.parent_code === newCity?.code);
                    return {
                        ...prevOrder,
                        id: orderData.id,
                        customerEmail: orderData.customerEmail,
                        name: orderData.name,
                        address: orderData.address,
                        phone: orderData.phone,
                        discountCode: DiscountCode?.code || "",
                        discountId: orderData.discountId,
                        shippingFee: orderData.shippingFee,
                        totalPrice: orderData.totalPrice,
                        note: orderData.note,
                        orderDate: orderData.orderDate ? orderData.orderDate.split('T')[0] : "",
                        cancelDate: orderData.cancelDate ? orderData.cancelDate.split('T')[0] : "",
                        completeDate: orderData.completeDate ? orderData.completeDate.split('T')[0] : "",
                        deliveryType: orderData.deliveryType,
                        paymentType: orderData.paymentType,
                        status: orderData.status,
                        city: orderData.city,
                        district: orderData.district,
                        ward: orderData.ward,
                        cityCode: newCity?.code,
                        districtCode: newDistrict?.code,
                    };
                });

                setIsValid({
                    email: true,
                    name: true,
                    address: true,
                    phone: true,
                    newEmail: true,
                    newName: true,
                    newAddress: true,
                    newPhone: true,
                });
            }

            getDiscountCode();
        }

        return () => {
            console.log("setOrder");
        }
    }, [orderData, action]);

    useEffect(() => {
        fetchShippingFee();

        return () => {
            console.log("fetchShippingFee");
        }
    }, [order.ward, order.city, order.district, order.deliveryType]);

    const fetchShippingFee = async () => {
        try {
            const city = order.city;
            const district = order.district;
            const ward = order.ward;
            const type = order.deliveryType;

            const provinceId = await getProvinceID(city);
            const districtId = await getDistrictID(provinceId, district);
            const wardId = await getWardId(districtId, ward);
            const shippingFee = await calculateFee(districtId, wardId, type);

            setOrder((prevOrder) => ({
                ...prevOrder,
                shippingFee: shippingFee,
            }));
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    const getProvinceID = async (cityName) => {
        try {
            const urlProvince = 'https://online-gateway.ghn.vn/shiip/public-api/master-data/province';
            const response = await fetch(urlProvince, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': '0a8e7e91-8da4-11ee-a59f-a260851ba65c',
                },
            });

            if (!response.ok) {
                throw new Error('Không thể nhận dữ liệu từ API');
            }

            const responseData = await response.json();
            const data = responseData.data;
            let provinceId = -1;

            data.forEach((dataItem) => {
                if (dataItem.NameExtension.includes(cityName)) {
                    provinceId = dataItem.ProvinceID;
                }
            });

            return provinceId;
        } catch (error) {
            console.error('Error:', error.message);
            return -1;
        }
    };

    const getDistrictID = async (provinceId, districtName) => {
        try {
            const urlDistrict = 'https://online-gateway.ghn.vn/shiip/public-api/master-data/district';
            const jsonData = JSON.stringify({province_id: provinceId});

            const response = await fetch(urlDistrict, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': '0a8e7e91-8da4-11ee-a59f-a260851ba65c',
                },
                body: jsonData,
            });

            if (!response.ok) {
                throw new Error('Không thể nhận dữ liệu từ API');
            }

            const responseData = await response.json();
            const data = responseData.data;
            let districtId = -1;

            data.forEach((dataItem) => {
                const lowercaseData = dataItem.NameExtension.map((name) => name.toLowerCase());
                const lowercaseSearchTerm = districtName.toLowerCase();

                if (lowercaseData.includes(lowercaseSearchTerm)) {
                    districtId = dataItem.DistrictID;
                }
            });

            return districtId;
        } catch (error) {
            console.error('Error:', error.message);
            return -1;
        }
    };

    const getWardId = async (districtId, wardName) => {
        try {
            const urlWard = 'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward';
            const jsonData = JSON.stringify({district_id: districtId});

            const response = await fetch(urlWard, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': '0a8e7e91-8da4-11ee-a59f-a260851ba65c',
                },
                body: jsonData,
            });

            if (!response.ok) {
                throw new Error('Không thể nhận dữ liệu từ API');
            }

            const responseData = await response.json();
            const data = responseData.data;

            let wardCode = -1;
            data.forEach((dataItem) => {
                const lowercaseData = dataItem.WardName.toLowerCase();
                const lowercaseSearchTerm = wardName.toLowerCase();

                if (lowercaseData.includes(lowercaseSearchTerm)) {
                    wardCode = dataItem.WardCode;
                }
            });

            return wardCode;
        } catch (error) {
            console.error('Error:', error.message);
            return -1;
        }
    };

    const calculateFee = async (toDistrictId, toWardCode, type) => {
        try {
            let serviceId = 5;
            if (type === "Standard") {
                serviceId = 2;
            }

            const urlFee = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';
            const jsonData = JSON.stringify({
                "service_type_id": serviceId,
                "from_district_id": 3695,
                "from_ward_code": "90737",
                "to_district_id": toDistrictId,
                "to_ward_code": toWardCode,
                "height": 20,
                "length": 30,
                "weight": 3000,
                "width": 40,
                "insurance_value": 0,
                "coupon": null,
                "items": [
                    {
                        "height": 20,
                        "length": 30,
                        "weight": 3000,
                        "width": 40
                    }
                ]
            });

            const response = await fetch(urlFee, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': '0a8e7e91-8da4-11ee-a59f-a260851ba65c',
                },
                body: jsonData,
            });

            if (!response.ok) {
                throw new Error('Không thể nhận dữ liệu từ API');
            }

            const responseData = await response.json();
            const totalFee = responseData.data?.total || -1;

            return totalFee;
        } catch (error) {
            console.error('Error:', error.message);
            return -1;
        }
    };

    const handleOnChange = useCallback(async (e) => {
            const {id, value} = e.target;

            if (id === "city") {
                const newCity = cities.find((tinh) => tinh.name === value);
                const newDistrict = districts.find((quan) => quan.parent_code === newCity?.code);
                const newWard = wards.find((xa) => xa.parent_code === newDistrict?.code);

                setOrder((prevOrder) => ({
                    ...prevOrder,
                    city: value,
                    cityCode: newCity?.code,
                    districtCode: newDistrict?.code,
                    district: newDistrict?.name,
                    ward: newWard?.name,
                }));
            } else if (id === "district") {
                const newDistrict = districts.find((quan) => quan.name === value);
                const newWard = wards.find((xa) => xa.parent_code === newDistrict?.code);

                setOrder((prevOrder) => ({
                    ...prevOrder,
                    district: value,
                    districtCode: newDistrict?.code,
                    ward: newWard?.name,
                }));
            } else {
                setOrder((prevOrder) => ({
                    ...prevOrder,
                    [id]: value,
                }));
            }
        }
    )

    const handleOnSaveOrder = useCallback(() => {
            if (isValid.email === true && isValid.name === true && isValid.address === true && isValid.phone === true) {
                if (action === "add") {
                    handleAddOrder(order, orderProducts);
                } else {
                    handleEditOrder(order);
                }
            } else {
                alert("Vui lòng nhập đầy đủ thông tin");
            }
        }
    )

    const handleSearchCustomer = useCallback(async (e) => {
            const {value} = e.target;
            const isValid = isValidEmail(value);
            setIsValid((prevIsValid) => ({
                ...prevIsValid,
                newEmail: false,
                email: isValid,
            }));
            if (isValid === false) return;
            try {
                const response = await fetchCustomer(order.customerEmail);
                if (response.status === 200) {
                    const newCity = cities.find((tinh) => tinh.name === response.data.city);
                    const newDistrict = districts.find((quan) => quan.parent_code === newCity?.code);
                    const newWard = wards.find((xa) => xa.parent_code === newDistrict?.code);
                    setOrder((prevOrder) => ({
                        ...prevOrder,
                        name: response.data.name,
                        address: response.data.address,
                        phone: response.data.phone,
                        city: response.data.city,
                        district: response.data.district,
                        ward: response.data.ward,
                        cityCode: newCity?.code,
                        districtCode: newDistrict?.code,
                    }));

                    setIsValid({
                        email: true,
                        name: true,
                        address: true,
                        phone: true,
                        newEmail: false,
                        newName: false,
                        newAddress: false,
                        newPhone: false,

                    });
                }
            } catch (e) {
                console.log(e);
                setIsNewCustomer(true);
            }
        }
    )

    const handleOpenDetailProducts = async () => {
        if (orderProductChanged === false && action === "edit") {
            await fetchOrderDetail(orderData.id).then((res) => {
                setOrderDetail(res);
            });
        } else {
            setOrderDetail(orderProducts);
        }
        console.log(orderDetail);

        setVisibleOrderProductDetail(true);
    }

    const handleCloseOrderProductDetail = () => {
        setVisibleOrderProductDetail(false);
        setOrderProductChanged(false);
    }

    const handleOnSaveOrderProducts = (orderProductsData) => {
        setOrderProducts(orderProductsData);
        const totalPrice = orderProductsData.reduce((total, orderProduct) => {
            return total + orderProduct.price * orderProduct.quantity;
        }, 0);
        setOrder((prevOrder) => ({
            ...prevOrder,
            totalPrice: totalPrice,
        }));
        setOrderProductChanged(true);
    }

    const handleDiscount = async (e) => {
        const discount = await fetchDiscountByCode(e.target.value);
        if (discount.status === 404) {
            alert("Mã giảm giá không tồn tại");
            setOrder((prevOrder) => ({
                ...prevOrder,
                discountCode: "",
            }));
            return;
        } else {
            if (discount.data.status === "expired") {
                alert("Mã giảm giá đã hết hạn");
                setOrder((prevOrder) => ({
                    ...prevOrder,
                    discountCode: "",
                }));
                return;
            } else if (discount.data.status === "disabled") {
                alert("Mã giảm giá đã bị vô hiệu");
                setOrder((prevOrder) => ({
                    ...prevOrder,
                    discountCode: "",
                }));
                return;
            }
        }

        if (order.totalPrice >= discount.minApply) {
            let newTotalPrice = order.totalPrice;
            if (discount.type === "percent") {
                const discountValue = order.totalPrice * (1 - discount.value) >= discount.maxSpeed ? discount.maxSpeed : order.totalPrice * (1 - discount.value);
                newTotalPrice = order.totalPrice - discountValue;
            } else if (discount.type === "fixed") {
                newTotalPrice = order.totalPrice - discount.value;
                setOrder((prevOrder) => ({
                    ...prevOrder,
                    discountId: discount.id,
                    totalPrice: newTotalPrice,
                }));
            }
        }
    }

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleValidField = (e) => {
        const {id, value} = e.target;

        setIsValid((prev) => ({
            ...prev,
            [id]: value !== "",
        }));

        const fields = ["customerEmail", "name", "address", "phone"];
        fields.forEach((field) => {
            if (id === field && isValid[`new${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
                setIsValid((prev) => ({
                    ...prev,
                    [`new${field.charAt(0).toUpperCase() + field.slice(1)}`]: false,
                }));
            }
        });
    };

    if (!visible) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm max-h-screen overflow-y-auto">

            <div className="bg-white p-3 rounded-md">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">Thông tin đơn hàng</div>
                    <button onClick={() => {
                        onClose();
                        setOrderProductChanged(false);
                    }}>X
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-5 text-xs md:text-xl lg:text-2xl">
                    <div className="">
                        <label className="" htmlFor="id">
                            ID
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            id="id"
                            onChange={(e) => handleOnChange(e)}
                            value={order.id}
                            disabled={true}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="customerEmail">
                            Email khách hàng(*)
                        </label>
                        <input
                            type="email"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newEmail) ? "" : (isValid.email) ? "" : "border-red-500"}`}
                            id="customerEmail"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleSearchCustomer(e)}
                            value={order.customerEmail}
                            disabled={action === "edit"}
                            required={true}
                        />
                        {
                            (isNewCustomer) && (
                                <h5 className="text-green-300 text-xs">"Khách hàng mới"</h5>
                            )}
                        {
                            (!isValid.email && !isValid.newEmail) && (
                                <h5 className="text-red-300 text-xs">"Email không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="name">
                            Tên khách hàng(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newName) ? "" : (isValid.name) ? "" : "border-red-500"}`}
                            id="name"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={order.name}
                            disabled={action === "edit"}
                        />
                        {
                            (!isValid.name && !isValid.newName) && (
                                <h5 className="text-red-300 text-xs">"Tên không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="address">
                            Địa chỉ(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newAddress) ? "" : (isValid.address) ? "" : "border-red-500"}`}
                            id="address"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={order.address}
                            disabled={action === "edit"}
                        />
                        {
                            (!isValid.address && !isValid.newAddress) && (
                                <h5 className="text-red-300 text-xs">"Địa chỉ không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className={""}>
                        <label className="" htmlFor="phone">
                            Số điện thoại(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newPhone) ? "" : (isValid.phone) ? "" : "border-red-500"}`}
                            id="phone"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={order.phone}
                            disabled={action === "edit"}
                        />
                        {
                            (!isValid.phone && !isValid.newPhone) && (
                                <h5 className="text-red-300 text-xs">"Số điện thoại không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className={""}>
                        <label className="" htmlFor="totalPrice">
                            Tổng tiền
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            id="totalPrice"
                            onChange={(e) => handleOnChange(e)}
                            value={order.totalPrice.toLocaleString('vi-VI')}
                            disabled={true}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="city">
                            Tỉnh/Thành phố
                        </label>
                        <select
                            name={"city"}
                            id={"city"}
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={order.city}
                            disabled={action === "edit"}
                        >
                            {
                                cities.map((tinh) => (
                                    <option value={tinh.name}
                                            key={tinh.code}
                                    >
                                        {tinh.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="">
                        <label className="m" htmlFor={"district"}>
                            Quận/Huyện
                        </label>
                        <select
                            name={"district"}
                            id={"district"}
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={order.district}
                            disabled={action === "edit"}
                        >
                            {
                                districts.map((quan) => (quan.parent_code === order.cityCode) && (
                                    <option key={quan.code}
                                            value={quan.name}
                                    >
                                        {quan.name}
                                    </option>
                                ))
                            }
                        </select>

                    </div>
                    <div className="">
                        <label className="" htmlFor="ward">
                            Xã/Phường
                        </label>
                        <select
                            name={"ward"}
                            id={"ward"}
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={order.ward}
                            disabled={action === "edit"}
                        >
                            {
                                wards.map((ward) => (
                                    (ward.parent_code === order.districtCode) &&
                                    <option key={ward.code}
                                            value={ward.name}
                                    >
                                        {ward.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="orderDate">
                            Ngày đặt hàng
                        </label>
                        <input
                            type="date"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            id="orderDate"
                            onChange={(e) => handleOnChange(e)}
                            value={order.orderDate}
                            disabled={action === "edit"}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="shippingFee">
                            Phí vận chuyển
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            id="shippingFee"
                            onChange={(e) => handleOnChange(e)}
                            value={order.shippingFee.toLocaleString('vi-VI')}
                            disabled={true}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="discountCode">
                            Mã giảm giá
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            id="discountCode"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleDiscount(e)}
                            value={order.discountCode}
                            disabled={action === "edit"}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="paymentType">
                            Hình thức thanh toán
                        </label>
                        <select
                            name={"paymentType"}
                            id={"paymentType"}
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={order.paymentType}
                            disabled={action === "edit"}
                        >
                            <option value={"Credit Card"}>Credit Card</option>
                            <option value={"PayPal"}>PayPal</option>
                            <option value={"Cash"}>Cash</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="deleveryType">
                            Hình thức giao hàng
                        </label>
                        <select
                            name={"deliveryType"}
                            id={"deliveryType"}
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={order.deliveryType}
                            disabled={action === "edit"}
                        >
                            <option value={"Standard"}>Tiêu chuẩn</option>
                            <option value={"Express"}>Nhanh</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="status">
                            Trạng thái
                        </label>
                        <select
                            name={"status"}
                            id={"status"}
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={order.status}
                            disabled={(orderData.status === "Done") || (orderData.status === "Cancelled") || action === "add"}
                        >
                            <option value={"Processing"}>Đang xử lý</option>
                            <option value={"Delivering"}>Đang giao</option>
                            <option value={"Done"}>Đã giao</option>
                            <option value={"Cancelled"}>Đã hủy</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="note">
                            Ghi chú
                        </label>
                        <textarea
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300`}
                            id="note"
                            onChange={(e) => handleOnChange(e)}
                            value={order.note}
                            disabled={action === "edit"}
                        />
                    </div>
                    <div className="">
                        <button
                            className="px-2 py-1 text-white bg-green-400 rounded-md"
                            onClick={handleOpenDetailProducts}
                        >
                            Chi tiết sản phẩm
                        </button>
                    </div>
                    <div className={"flex justify-end"}>
                        {
                            (action === "add" || (order.status !== "Done") || (order.status !== "Cancelled")) &&
                            <button
                                className="px-2 py-1 text-white bg-blue-500 rounded-md"
                                onClick={handleOnSaveOrder}
                            >
                                Lưu
                            </button>
                        }
                    </div>
                </div>
            </div>

            {
                visibleOrderProductDetail &&
                <OrderProductDetail visible={visibleOrderProductDetail} onClose={handleCloseOrderProductDetail}
                                    order={order} action={action} onSave={handleOnSaveOrderProducts}
                                    orderDetail={orderDetail}/>
            }
        </div>
    );
}