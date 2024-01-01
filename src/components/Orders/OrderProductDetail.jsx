import React, {useState, useEffect, useMemo, useRef, useCallback} from "react";
import {fetchProductQuantity, fetchTotalProductQuantity} from "../../services/Product/ProductQuantity";
import {fetchProduct} from "../../services/Product/Product";
import {getLastId} from "../../services/Order/Order";

export default function OrderProductDetail({visible, onClose, order, action, onSave, orderDetail}) {
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderProduct, setOrderProduct] = useState({
        id: 0,
        productId: "",
        color: "",
        quantity: 0,
        price: 0,
        totalPrice: 0,
    });

    const [orderProductsLength, setOrderProductsLength] = useState(0);
    const [currentOrderProduct, setCurrentOrderProduct] = useState(0);
    const [productQuantity, setProductQuantity] = useState([]);
    const [totalProductQuantity, setTotalProductQuantity] = useState(0);
    const [isValid, setIsValid] = useState({
        productId: true,
        color: true,
        quantity: true,
    });

    useEffect(() => {
        setOrderProducts((prevOrderProducts) => {
            const orderProducts = [...prevOrderProducts];
            orderProducts[currentOrderProduct - 1] = {
                productId: orderProduct.productId || "",
                color: orderProduct.color || "",
                quantity: orderProduct.quantity || 0,
                price: orderProduct.price || 0,
                totalPrice: orderProduct.totalPrice || 0,
            };
            return orderProducts;
        });
    }, [orderProduct]);

    useEffect(() => {
        calculateTotalPrice();

        return () => {
            console.log("Calculate total price");
        }
    }, [orderProduct.price, orderProduct.quantity]);

    useEffect(() => {
        setOrderProduct(
            {
                productId: orderDetail.productId,
                color: orderDetail.color,
                quantity: orderDetail.quantity,
                price: orderDetail.price,
                totalPrice: orderDetail.totalPrice,
            }
        )
        setOrderProducts(orderDetail);
        setOrderProductsLength(orderDetail.length);

        return () => {
            console.log("Set order products");
        }
    }, [orderDetail]);

    const handleOnChange = useCallback(async (e) => {
        const {id, value} = e.target;
        let price = 0;
        let totalPrice = 0;

        if (id === "productId" && value !== "") {
            setOrderProduct((prevOrderProduct) => ({
                ...prevOrderProduct,
                productId: value,
            }));
        } else if (id === "color") {
            const fetchData = async () => {
                try {
                    const totalProductQuantity = await fetchTotalProductQuantity(orderProduct.productId, value);
                    setTotalProductQuantity(totalProductQuantity);

                    const productData = await fetchProduct(orderProduct.productId);
                    const price = Number(productData.price);
                    setOrderProduct((prevOrderProduct) => ({
                        ...prevOrderProduct,
                        color: value,
                        price: price,
                    }));

                    if (value === "") {
                        setIsValid((prevState) => ({
                            ...prevState,
                            color: false,
                        }));
                    } else {
                        setIsValid((prevState) => ({
                            ...prevState,
                            color: true,
                        }));
                    }
                } catch (err) {
                    console.error(err);
                }
            };

            await fetchData();
        } else if (id === "quantity") {
            const quantityValue = Number(value);

            setOrderProduct((prevOrderProduct) => ({
                ...prevOrderProduct,
                quantity: quantityValue,
            }));
        } else {
            setOrderProduct((prevOrderProduct) => ({
                ...prevOrderProduct,
                [id]: value,
            }));
        }
    }, [orderProduct.productId, orderProduct.price, orderProduct.quantity]);

    const calculateTotalPrice = () => {
        orderProduct.totalPrice = Number(orderProduct.price) * Number(orderProduct.quantity);
    };

    const setProductsData = async () => {
        if (orderProduct.productId === "") {
            return;
        }

        try {
            const productsQuantityData = await fetchProductQuantity(orderProduct.productId);

            if (productsQuantityData.length === 0) {
                setIsValid((prevState) => ({
                    ...prevState,
                    productId: false,
                }));
            } else {
                setIsValid((prevState) => ({
                    ...prevState,
                    productId: true,
                }));
            }
            setProductQuantity(productsQuantityData);
        } catch (err) {
            console.error(err);
        }
    };


    const handleDisplayOrderProduct = async (e) => {
        const {value} = e.target;

        if (value === "") {
            setOrderProduct({
                productId: "",
                color: "",
                quantity: "",
                price: "",
                totalPrice: "",
            });
            setCurrentOrderProduct(0);
        } else {
            setCurrentOrderProduct(value);
            setOrderProduct(orderProducts[value - 1]);
        }
    };


    const handleOnAddOrderProduct = async () => {
        const lastId = await getLastId();
        setOrderProductsLength(orderProductsLength + 1);
        setCurrentOrderProduct(orderProductsLength + 1);
        setOrderProduct({
            id: lastId + 1,
            productId: "",
            color: "",
            quantity: "",
            price: "",
            totalPrice: "",
        });
        setOrderProducts((prevState) => [
            ...prevState,
            {
                id: lastId + 1,
                productId: "",
                color: "",
                quantity: "",
                price: "",
                totalPrice: "",
            },
        ]);
    };

    const handleOnSave = () => {
        if (isValid.productId && isValid.color && isValid.quantity) {
            onSave(orderProducts);
            onClose();
        } else {
            alert("Vui lòng nhập đúng thông tin");
        }
    };

    const handleOnDeleteProduct = () => {
        setOrderProducts((prevData) =>
            prevData.map((item, i) =>
                i === currentOrderProduct - 1 ? {...item, isDeleted: true} : item
            )
        );
        setOrderProductsLength((prevLength) => prevLength - 1);

        // Update productImage after the state has been updated
        setTimeout(() => {
            setOrderProduct(orderProducts[currentOrderProduct - 2] || {});
            setCurrentOrderProduct((prevCurrent) => prevCurrent - 1);
        }, 0);
    };

    const handleValidateQuantity = (e) => {
        const {value} = e.target;
        const totalPrice = Number(orderProduct.price) * Number(value);

        setOrderProduct((prevOrderProduct) => ({
            ...prevOrderProduct,
            totalPrice: totalPrice,
        }));

        if (isNaN(value) || Number(value) > totalProductQuantity) {
            setIsValid((prevState) => ({
                ...prevState,
                quantity: false,
            }));
        } else {
            setIsValid((prevState) => ({
                ...prevState,
                quantity: true,
            }));
        }
    }


    if (!visible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm">
            <div className="bg-white p-3 rounded-md">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">Chi tiết sản phẩm của đơn hàng</div>
                    <button onClick={onClose}>X</button>
                </div>
                <div className="grid grid-cols-2 gap-5 text-xs md:text-xl lg:text-2xl">
                    <div>
                        <label htmlFor={"stt"}>Sản phẩm thứ </label>
                        <select
                            className={`border border-black rounded-md text-center`}
                            id="stt"
                            onChange={(e) => handleDisplayOrderProduct(e)}
                            defaultValue={""}
                            value={currentOrderProduct}
                        >
                            <option value={""}></option>
                            {
                                orderProductsLength !== null &&
                                Array.from(Array(orderProductsLength + 1).keys())
                                    .filter(stt => stt !== 0) // Lọc bỏ giá trị 0
                                    .map((stt, index) => (
                                        <option
                                            key={index}
                                            value={stt}
                                        >
                                            {stt}
                                        </option>
                                    ))
                            }

                        </select>
                    </div>
                    <div>
                        {
                            (action === "add") &&
                            <button
                                type="button"
                                className="px-2 py-1 text-white bg-green-400 rounded-md"
                                onClick={handleOnAddOrderProduct}
                            >
                                Thêm một sản phẩm
                            </button>
                        }
                    </div>
                    <div>
                        <label htmlFor="productId">Mã sản phẩm</label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="productId"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={setProductsData}
                            value={orderProduct.productId}
                            disabled={currentOrderProduct === 0 || action === "edit"}
                        />
                        {!isValid.productId && (
                            <h5 className="text-red-500 text-xs">"Mã sản phẩm không tồn tại"</h5>
                        )}
                    </div>
                    <div>
                        <label htmlFor="color">Màu sắc</label>
                        <select
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="color"
                            onChange={(e) => handleOnChange(e)}
                            value={orderProduct.color}
                            disabled={currentOrderProduct === 0 || action === "edit"}
                        >
                            <option value={""}></option>
                            {
                                productQuantity &&
                                productQuantity.map((product, index) => (
                                    <option
                                        key={index}
                                        value={product.color}
                                    >
                                        {product.color}
                                    </option>
                                ))
                            }
                        </select>
                        {!isValid.color && (
                            <h5 className="text-red-500 text-xs">"Màu sắc không hợp lệ"</h5>
                        )}
                    </div>
                    <div>
                        <label htmlFor="quantity">Số lượng</label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="quantity"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidateQuantity(e)}
                            value={orderProduct.quantity || ""}
                            disabled={currentOrderProduct === 0 || action === "edit"}
                        />
                        {action === "add" && (
                            <span className="text-red-500 text-xs">
                                Còn lại: {totalProductQuantity}
                            </span>
                        )}

                        {!isValid.quantity && (
                            <h5 className="text-red-500 text-xs">Số lượng không hợp lệ</h5>
                        )}

                    </div>
                    <div>
                        <label htmlFor="price">Giá tiền</label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="price"
                            value={orderProduct.price || ""}
                            disabled={true}
                        />
                    </div>
                    <div className={"col-span-2"}>
                        <label htmlFor="totalPrice">Tổng tiền</label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="totalPrice"
                            value={orderProduct.totalPrice || ""}
                            disabled={true}
                        />
                    </div>
                    {
                        (action === "add" && currentOrderProduct !== 0) &&
                        (
                            <>
                                <div className="">
                                    <button
                                        type="button"
                                        className="px-2 py-1 text-white bg-red-400 rounded-md"
                                        onClick={handleOnDeleteProduct}
                                        hidden={currentOrderProduct === 0}
                                    >
                                        Xóa sản phẩm
                                    </button>
                                </div>
                                <div className={"justify-end flex"}>
                                    <button
                                        type="button"
                                        className="px-2 py-1 text-white bg-blue-500 rounded-md"
                                        onClick={handleOnSave}
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
