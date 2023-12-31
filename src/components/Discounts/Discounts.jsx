import React, {useState, useEffect, useRef} from "react";
import DiscountDetail from "./DiscountDetail";
import {AddDiscount, fetchDiscounts, fetchLastDiscountId, UpdateDiscount} from "../../services/Discount/Discount";


export default function Discounts() {
    const [discounts, setDiscounts] = useState([]);
    const [discount, setDiscount] = useState({
        id: "",
        code: "",
        type: "",
        value: "",
        quantity: "",
        startDate: "",
        endDate: "",
        status: "",
        minApply: "0",
        maxSpeed: "-1",
        description: "",
    });
    const [action, setAction] = useState("");
    const [visibleDiscountDetail, setVisibleDiscountDetail] = useState(false);

    const [originalDiscounts, setOriginalDiscounts] = useState([]);

    const search = useRef({
        searchValue: "",
        sortValue: "code",
        statusValue: "all"
    });

    useEffect(() => {
        localStorage.setItem("menu", "discounts");
    }, []);

    useEffect(() => {
        fetchDiscounts().then((response) => {
            setOriginalDiscounts(response.data);
            setDiscounts(response.data);
        });
    }, []);

    const handleOnSearch = () => {
        const searchValue = search.current.searchValue;
        const sortValue = search.current.sortValue;
        const statusValue = search.current.statusValue;

        const searchResult = originalDiscounts.filter((discount) => {
            const discountValue = discount[sortValue];

            if (statusValue === "all") {
                return discountValue.toString().toLowerCase().includes(searchValue.toLowerCase());
            } else {
                return discountValue.toString().toLowerCase().includes(searchValue.toLowerCase()) && discount.status === statusValue;
            }
        });

        setDiscounts(searchResult);
    }

    const handleOnChangeSearchType = (e) => {
        const {id, value} = e.target;
        search.current = {
            ...search.current,
            [id]: value
        };
    }

    const handleOpenEditDiscount = (discount) => {
        setDiscount(discount);
        setAction("edit");
        setVisibleDiscountDetail(true);
    }

    const handleOpenAddDiscount = async () => {
        setAction("add");
        const response = await fetchLastDiscountId();
        const lastId = response.data;
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let isoTomorrow = tomorrow.toISOString().split('T')[0];
        setDiscount({
            ...discount,
            id: lastId + 1,
            startDate: new Date().toISOString().split('T')[0],
            endDate: isoTomorrow,
            status: "active",
            type: "percent",
            minApply: 0,
            maxSpeed: -1,
        })
        setVisibleDiscountDetail(true);
    }

    const handleCloseDiscountDetail = () => {
        setVisibleDiscountDetail(false);
        setDiscount({});
    }

    const handleAddDiscount = async (discount) => {
        try {
            const response = await AddDiscount(discount);
            if (response.status === 201) {
                alert("Thêm mã giảm giá thành công");
                const currentDate = new Date();
                // Chuyển đổi sang múi giờ GMT+7
                const gmtPlus7Date = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));

                // Lấy ngày dưới định dạng ISO (YYYY-MM-DD)
                const isoDate = gmtPlus7Date.toISOString().split('T')[0];

                // Kiểm tra nếu ngày hết hạn của discount đã qua
                const isExpired = discount.endDate <= isoDate;
                if (discount.status !== "inactive") {
                    if (isExpired) {
                        discount.status = "expired";
                    } else {
                        discount.status = "active"
                    }
                }
                setDiscounts([...discounts, discount]);
                setOriginalDiscounts([...originalDiscounts, discount]);
                setVisibleDiscountDetail(false);
                setDiscount({});
            }
        } catch (e) {
            console.error(e.message);
            alert("Thêm mã giảm giá thất bại");
        }
    }

    const handleEditDiscount = async (discount) => {
        try {
            const response = await UpdateDiscount(discount);
            if (response.status === 204) {
                alert("Sửa mã giảm giá thành công");
                const currentDate = new Date();
                // Chuyển đổi sang múi giờ GMT+7
                const gmtPlus7Date = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));

                // Lấy ngày dưới định dạng ISO (YYYY-MM-DD)
                const isoDate = gmtPlus7Date.toISOString().split('T')[0];

                // Kiểm tra nếu ngày hết hạn của discount đã qua
                const isExpired = discount.endDate <= isoDate;
                if (discount.status !== "inactive") {
                    if (isExpired) {
                        discount.status = "expired";
                    } else {
                        discount.status = "active"
                    }
                }
                const newDiscounts = discounts.map((item) => {
                    if (item.id === discount.id) {
                        return discount;
                    }
                    return item;
                });
                setDiscounts(newDiscounts);
                const newOriginalDiscounts = originalDiscounts.map((item) => {
                    if (item.id === discount.id) {
                        return discount;
                    }
                    return item;
                });
                setOriginalDiscounts(newOriginalDiscounts);
                setVisibleDiscountDetail(false);
                setDiscount({});
            }
        } catch (e) {
            console.error(e.message);
            alert("Sửa mã giảm giá thất bại");
        }
    }

    return (
        <div className="">
            <div className="top-0 right-0 backdrop-blur-sm grid grid-cols-6 grid-rows-2 lg:grid-rows-1 lg:text-xl">
                <button
                    className="col-start-1 col-end-3 lg:col-end-2 row-start-1 row-end-2 border border-green-500 rounded-md bg-green-500 text-white"
                    onClick={handleOpenAddDiscount}
                >
                    Thêm mới
                </button>

                <input
                    type="text"
                    id="searchValue"
                    className="col-start-3 lg:col-start-2 col-end-7 lg:col-end-4 row-start-1 row-end-2 border border-blue-300 rounded-md"
                    placeholder="Tìm kiếm mã giảm giá"
                    value={search.searchValue}
                    onChange={(e) => handleOnChangeSearchType(e)}
                />
                <select
                    className="col-start-1 col-end-3 lg:col-start-4 lg:col-end-5 row-start-2 lg:row-start-1 row-end-3 lg:row-end-2 border border-blue-300 rounded-md"
                    id="sortValue"
                    onChange={(e) => handleOnChangeSearchType(e)}
                >
                    <option value="code">Mã</option>
                    <option value="value">Trị giá</option>
                </select>
                <select
                    className="col-start-3 col-end-5 lg:col-start-5 lg:col-end-6 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 border border-blue-300 rounded-md"
                    id="statusValue"
                    onChange={(e) => handleOnChangeSearchType(e)}
                >
                    <option value="all">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                    <option value="expired">Đã hết hạn</option>
                </select>

                <button
                    className="col-start-5 col-end-7 lg:col-start-6 lg:col-end-7 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 border border-blue-300 rounded-md bg-blue-400 text-white"
                    onClick={handleOnSearch}
                >
                    Tìm kiếm
                </button>
            </div>
            <div className="overflow-x-auto overflow-y-auto h-[85vh] lg:h-[87vh]">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="text-center py-3">
                            ID
                        </th>
                        <th scope="col" className="text-center ">
                            Mã
                        </th>
                        <th scope="col" className="text-center ">
                            Loại giảm giá
                        </th>
                        <th scope="col" className="text-center ">
                            Trị giá
                        </th>
                        <th scope="col" className="text-center ">
                            Số lượng
                        </th>
                        <th scope="col" className="text-center ">
                            Ngày bắt đầu
                        </th>
                        <th scope="col" className="text-center ">
                            Ngày kết thúc
                        </th>
                        <th scope="col" className="text-center ">
                            Trạng thái
                        </th>
                        <th scope="col" className="text-center ">
                            Hành động
                        </th>
                    </tr>
                    </thead>
                    <tbody className={"text-xs md:text-base text-center"}>
                    {
                        discounts.map(discount => (
                                <tr
                                    key={discount.id}
                                    className="odd:bg-white even:bg-gray-50 border-b dark:border-gray-700"
                                >
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.id}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.code}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.type}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.value}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.quantity}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.startDate}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.endDate}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        {discount.status === "active" ? "Đang hoạt động" : (discount.status === "inactive" ? "Ngừng hoạt động" : "Đã hết hạn")}
                                    </td>
                                    <td
                                        scope="row"
                                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap"
                                    >
                                        <button
                                            className="px-2 py-1 text-white bg-blue-400 rounded-md"
                                            onClick={() => handleOpenEditDiscount(discount)}
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            )
                        )
                    }
                    </tbody>
                </table>
            </div>

            <DiscountDetail visible={visibleDiscountDetail} onClose={handleCloseDiscountDetail} discountData={discount}
                            action={action} handleAddDiscount={handleAddDiscount}
                            handleEditDiscount={handleEditDiscount}/>
        </div>
    );
}
