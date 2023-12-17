import React, {useState, useEffect} from "react";
import axios from "../../api/axios";

export default function OrderProductDetail({visible, onClose, order, action, onSave, orderDetail}) {
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderProduct, setOrderProduct] = useState({
        productId: "",
        color: "",
        quantity: "",
        price: "",
        totalPrice: "",
    });
    const [orderProductsLength, setOrderProductsLength] = useState(0);
    const [currentOrderProduct, setCurrentOrderProduct] = useState("");
    const [productQuantity, setProductQuantity] = useState([]);
    const [totalProductQuantity, setTotalProductQuantity] = useState(0);

    const handleOnChange = async (e) => {
        const {id, value} = e.target;

        if (id === "productId" && value !== "") {
            setOrderProduct(
                (prevData) => ({
                    ...prevData,
                    [id]: value,
                })
            )
            const fetchData = async () => {
                try {
                    const productData = await fetchProduct();
                    if (isComponentMounted()) {
                        setProductQuantity(productData);
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            await fetchData();

        } else if (id === "color") {
            setOrderProduct(
                (prevData) => ({
                    ...prevData,
                    [id]: value,
                    price: productQuantity.find(product => product.color === value).price
                })
            )
            const fetchData = async () => {
                try {
                    const totalProductQuantity = await fetchTotalProductQuantity(orderProduct.productId, value);
                    setTotalProductQuantity(totalProductQuantity);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchData();
        } else if (id === "quantity") {
            const totalPrice = Number(orderProduct.price) * value;
            setOrderProduct((prevData) => ({
                ...prevData,
                [id]: value,
                totalPrice: totalPrice,
            }));
        } else {
            setOrderProduct((prevData) => ({
                ...prevData,
                [id]: value,
            }));
        }

        setOrderProducts((prevOrderProducts) => {
            const indexToUpdate = currentOrderProduct - 1;

            if (indexToUpdate >= 0 && indexToUpdate < orderProductsLength) {
                return prevOrderProducts.map((orderProduct, index) => {
                    if (index === indexToUpdate) {
                        return {
                            ...orderProduct,
                            [id]: value,
                        };
                    }
                    return orderProduct;
                });
            }
            return prevOrderProducts;
        });
    };

    useEffect(() => {
        const calculateTotalPrice = () => {
            setOrderProduct((prevOrderProduct) => ({
                ...prevOrderProduct,
                totalPrice:
                    prevOrderProduct.price && prevOrderProduct.quantity
                        ? prevOrderProduct.price * prevOrderProduct.quantity
                        : "",
            }));
        };

        calculateTotalPrice();

        return calculateTotalPrice;
    }, [orderProduct.price, orderProduct.quantity]);

    useEffect(() => {
        let isMounted = true;
        //
        // const fetchData = async () => {
        //     if (action === "edit") {
        //         try {
        //             const orderProductsData = await fetchOrderDetail();
        //             if (isComponentMounted()) {
        //                 setOrderProducts(orderProductsData);
        //                 setOrderProductsLength(orderProductsData.length);
        //             }
        //         } catch (err) {
        //             console.error(err);
        //         }
        //     }
        // };
        //
        // fetchData();
        //
        if (isComponentMounted()) {
            setOrderProducts(orderDetail);
            setOrderProductsLength(orderDetail.length);
        }
        return () => {
            isMounted = false;
        };
    }, [orderDetail]);

    const fetchOrderDetail = async () => {
        try {
            const response = await axios.get(`/OrderDetail/OrderId=${order.id}`);
            return response.data;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const setProductsData = async () => {
        if (orderProduct.productId === "") {
            return;
        }

        try {
            const productsQuantityData = await fetchProductQuantity(
                orderProduct.productId
            );
            const totalProductQuantity = await fetchTotalProductQuantity(orderProduct.productId, orderProduct.color);
            setTotalProductQuantity(totalProductQuantity);
            if (isComponentMounted()) {
                setProductQuantity(productsQuantityData);
            }

            const productData = await fetchProduct();
            setOrderProduct((prevOrderProduct) => ({
                ...prevOrderProduct,
                price: productData.price,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLastId = async () => {
        try {
            const response = await axios.get("/OrderProductDetail/GetLastId");
            return response.data;
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProductQuantity = async (productId) => {
        try {
            const response = await axios.get(`/ProductQuantity/ProductId=${productId}`);
            return response.data;
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`/Product/${orderProduct.productId}`);
            return response.data;
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTotalProductQuantity = async (productId, color) => {
        try {
            const response = await axios.get(`/ProductQuantity/TotalQuantity/ProductId=${productId}&ProductColor=${color}`);
            return response.data;
        } catch (err) {
            console.error(err);
            return 0;
        }
    };

    const handleDisplayOrderProduct = async (e) => {
        const {value} = e.target;

        if (value === "") {
            setCurrentOrderProduct(() => value);

            setOrderProduct({
                productId: "",
                color: "",
                quantity: "",
                price: "",
                totalPrice: "",
            });
        } else {
            const totalProductQuantity = await fetchTotalProductQuantity(orderProducts[value - 1].productId, orderProducts[value - 1].color);
            setTotalProductQuantity(totalProductQuantity);
            setCurrentOrderProduct(() => value);

            if (orderProducts[value - 1]) {
                setOrderProduct((prevState) => ({
                    ...prevState,
                    productId: orderProducts[value - 1].productId,
                    color: orderProducts[value - 1].color,
                    quantity: orderProducts[value - 1].quantity,
                    price: orderProducts[value - 1].price,
                    totalPrice: orderProducts[value - 1].totalPrice,
                }));

                const productQuantityData = await fetchProductQuantity(orderProducts[value - 1].productId);
                if (isComponentMounted()) {
                    setProductQuantity(productQuantityData);
                }
            }
        }
    };

    const handleOnAddOrderProduct = () => {
        setOrderProductsLength((prevState) => prevState + 1);
        setOrderProducts((prevState) => [
            ...prevState,
            {
                id: 0,
                productId: "",
                color: "",
                quantity: "",
                price: "",
                totalPrice: "",
            },
        ]);
    };

    const handleOnSave = () => {
        onSave(orderProducts);
        onClose();
    };


    const isComponentMounted = () => {
        return Boolean(document.getElementById("root"));
    };

    const handleOnDeleteProduct = () => {
        if (orderProductsLength !== 0 && currentOrderProduct !== "") {
            const indexToDelete = currentOrderProduct - 1;

            if (indexToDelete >= 0 && indexToDelete < orderProductsLength) {
                setOrderProducts((prevState) => prevState.filter((_, index) => index !== indexToDelete));
                setOrderProductsLength((prevState) => prevState - 1);

                if (indexToDelete === orderProductsLength - 1) {
                    setCurrentOrderProduct((prevState) => prevState - 1);

                    setOrderProduct({
                        productId: orderProducts[indexToDelete - 1]?.productId || "",
                        color: orderProducts[indexToDelete - 1]?.color || "",
                        quantity: orderProducts[indexToDelete - 1]?.quantity || "",
                        price: orderProducts[indexToDelete - 1]?.price || "",
                        totalPrice: orderProducts[indexToDelete - 1]?.totalPrice || "",
                    });
                } else {
                    setOrderProduct({
                        productId: orderProducts[indexToDelete]?.productId || "",
                        color: orderProducts[indexToDelete]?.color || "",
                        quantity: orderProducts[indexToDelete]?.quantity || "",
                        price: orderProducts[indexToDelete]?.price || "",
                        totalPrice: orderProducts[indexToDelete]?.totalPrice || "",
                    });
                }
            }
        }
    };


    if (!visible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm text-xl">
            <div className="bg-white p-4 rounded">
                <div className="title flex justify-between px-1">
                    <div className="text-3xl">Chi tiết sản phẩm của đơn hàng</div>
                    <button onClick={onClose}>X</button>
                </div>

                <div className="content">
                    <form className="form overflow-auto">
                        <table className="col-span-2">
                            <thead>
                            <tr>
                                <td>
                                    <label htmlFor={"stt"}>Sản phẩm thứ </label>
                                    <select
                                        className="form-control border border-black rounded-md disabled:bg-slate-200 mb-2 mr-2"
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
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-primary border border-green-500 bg-amber-400 rounded-md p-2"
                                        onClick={handleOnAddOrderProduct}
                                    >
                                        Thêm một sản phẩm
                                    </button>
                                </td>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="productId">Mã sản phẩm</label>
                                    <input
                                        type="text"
                                        className="form-control border border-black rounded-md disabled:bg-slate-200 mb-2 mr-2"
                                        id="productId"
                                        onChange={(e) => handleOnChange(e)}
                                        onBlur={setProductsData}
                                        value={orderProduct.productId}
                                        disabled={currentOrderProduct === ""}
                                    />
                                </td>
                                <td>
                                    <label htmlFor="color">Màu sắc</label>
                                    <select
                                        className="form-control border border-black rounded-md disabled:bg-slate-200 mb-2 mr-2"
                                        id="color"
                                        onChange={(e) => handleOnChange(e)}
                                        value={orderProduct.color}
                                        disabled={currentOrderProduct === ""}
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
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="quantity">Số lượng</label>
                                    <input
                                        type="text"
                                        className="form-control border border-black rounded-md disabled:bg-slate-200 mb-2"
                                        id="quantity"
                                        onChange={(e) => handleOnChange(e)}
                                        value={orderProduct.quantity}
                                        disabled={currentOrderProduct === ""}
                                    />
                                    <span
                                        className="text-red-500 text-xs"
                                    >
                                        Còn lại: {totalProductQuantity}
                                    </span>
                                </td>
                                <td>
                                    <label htmlFor="price">Giá tiền</label>
                                    <input
                                        type="text"
                                        className="form-control border border-black rounded-md disabled:bg-slate-200 mb-2"
                                        id="price"
                                        onChange={(e) => handleOnChange(e)}
                                        value={orderProduct.price}
                                        disabled={true}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="totalPrice">Tổng tiền</label>
                                    <input
                                        type="text"
                                        className="form-control border border-black rounded-md disabled:bg-slate-200 mb-2"
                                        id="totalPrice"
                                        onChange={(e) => handleOnChange(e)}
                                        value={orderProduct.totalPrice}
                                        disabled={true}
                                    />
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="form-group flex justify-between">
                            <button
                                type="button"
                                className="btn btn-primary border border-green-500 bg-red-400 rounded-md p-2"
                                onClick={handleOnDeleteProduct}
                            >
                                Xóa sản phẩm
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary border border-green-500 bg-green-500 rounded-md p-2"
                                onClick={handleOnSave}
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
