import React, {useState, useEffect} from "react";
import productAdapter from "./ProductAdapter";
import productBackupCharger from "./ProductBackupCharger";
import ProductPhone from "./ProductPhone";
import ProductQuantity from "./ProductQuantity";
import productCable from "./ProductCable";
import ProductCable from "./ProductCable";
import ProductBackupCharger from "./ProductBackupCharger";
import ProductAdapter from "./ProductAdapter";
import {AddProduct, UpdateProduct} from "../../services/Product/Product";
import {
    AddProductQuantity,
    DeleteProductQuantity,
    fetchProductQuantity,
    UpdateProductQuantity
} from "../../services/Product/ProductQuantity";
import {AddProductCable, fetchProductCable, UpdateProductCable} from "../../services/Product/ProductCable";
import {AddProductPhone, fetchProductPhone, UpdateProductPhone} from "../../services/Product/ProductPhone";
import {
    AddProductBackupCharger,
    fetchProductBackupCharger,
    UpdateProductBackupCharger
} from "../../services/Product/ProductBackupCharger";
import {AddProductAdapter, fetchProductAdapter, UpdateProductAdapter} from "../../services/Product/ProductAdapter";
import {AddImageDetail, DeleteImageDetail, UpdateImageDetail} from "../../services/ImageDetail/ImageDetail";
import {fetchCategory} from "../../services/Category/Category";

export default function ProductDetail({action, visible, onClose, product, onReload}) {
    const [productData, setProductData] = useState(product); // Data of product
    const [category, setCategory] = useState([]); // List of category
    const categoryNames = {
        1: "Điện thoại",
        2: "Sạc",
        3: "Cáp",
        4: "Sạc dự phòng",
    };
    const [actionType, setActionType] = useState(action); // Action type of ProductDetail

    const [productQuantity, setProductQuantity] = useState([]); // List of product quantity
    const [productAdapter, setProductAdapter] = useState({}); // Product adapter
    const [productBackupCharger, setProductBackupCharger] = useState({}); // Product backup charger
    const [productPhone, setProductPhone] = useState({}); // Product phone
    const [productCable, setProductCable] = useState({}); // Product cable
    const [productImage, setProductImage] = useState([]); // Product image

    const [productQuantityVisible, setProductQuantityVisible] = useState(false); // Visible of ProductQuantity
    const [productPhoneVisible, setProductPhoneVisible] = useState(false); // Visible of ProductPhone
    const [productAdapterVisible, setProductAdapterVisible] = useState(false); // Visible of ProductAdapter
    const [productBackupChargerVisible, setProductBackupChargerVisible] = useState(false); // Visible of ProductBackupCharger
    const [productCableVisible, setProductCableVisible] = useState(false); // Visible of ProductCable

    const [actionOnProductParameter, setActionOnProductParameter] = useState(""); // Action of ProductParameter

    const [isValid, setIsValid] = useState({
        name: false,
        price: false,
        preDiscount: false,
        discountPercent: false,
        brand: false,
        newName: true,
        newPrice: true,
        newPreDiscount: true,
        newDiscountPercent: true,
        newBrand: true,
    });

    useEffect(() => {
        setProductData(product);

        const fetchCategoryList = async () => {
            await fetchCategory().then((res) => {
                setCategory(res);
            });
        }

        fetchCategoryList();
        if (actionType === "edit") {
            const fetchProductInfo = async () => {
                await fetchProductQuantity(productData.id).then((res) => {
                    setProductQuantity(res);
                });
                await fetchProductBackupCharger(productData.id).then((res) => {
                    setProductBackupCharger(res);
                });
                await fetchProductAdapter(productData.id).then((res) => {
                    setProductAdapter(res);
                });
                await fetchProductPhone(productData.id).then((res) => {
                    setProductPhone(res);
                });
                await fetchProductCable(productData.id).then((res) => {
                    setProductCable(res);
                });

                setIsValid({
                    ...isValid,
                    name: true,
                    price: true,
                    preDiscount: true,
                    discountPercent: true,
                    brand: true,
                    newName: true,
                    newPrice: true,
                    newPreDiscount: true,
                    newDiscountPercent: true,
                    newBrand: true,
                });
            }

            fetchProductInfo();
        } else {
            setProductQuantity([]);
            setProductAdapter({});
            setProductBackupCharger({});
            setProductPhone({});
            setProductCable({});

            setIsValid({
                ...isValid,
                name: false,
                price: false,
                preDiscount: false,
                discountPercent: false,
                brand: false,
                newName: true,
                newPrice: true,
                newPreDiscount: true,
                newDiscountPercent: true,
                newBrand: true,
            });
        }
    }, [product]);

    const handleOnChange = (e) => {
        const {id, value} = e.target;
        setProductData(
            {
                ...productData,
                [id]: value
            }
        );
    };

    const handleUploadImage = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                const imageDataUrl = reader.result;

                // Tách chuỗi bằng dấu phẩy
                const parts = imageDataUrl.split(",");

                // Lấy phần sau của dấu phẩy (index 1 trong mảng)
                const base64String = parts[1];

                setProductData({
                    ...productData,
                    image: base64String,
                });
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    };


    const handleOnDeleteImage = (e) => {
        setProductData({
            ...productData,
            image: null,
        });
    }

    const handleOnSave = async () => {
        if (!isValid.name || !isValid.price || !isValid.preDiscount || !isValid.discountPercent || !isValid.brand) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        if (actionType === "add") {
            let falseUpdate = [];
            try {
                const productUpdateResponse = await AddProduct(productData);
                if (productUpdateResponse.status === 204) {
                    if (productQuantity.length > 0) {
                        await Promise.all(
                            productQuantity.map(async (item) => {
                                try {
                                    const quantityCreateResponse = await AddProductQuantity({
                                        productId: productData.id,
                                        color: item.color,
                                        quantity: item.quantity,
                                        sold: 0,
                                    });
                                    if (quantityCreateResponse.status !== 201) {
                                        falseUpdate.push(item);
                                    }
                                } catch (quantityError) {
                                    falseUpdate.push(item);
                                    console.error(quantityError);
                                }
                            }));
                    }

                    if (Object.keys(productCable).length > 0) {
                        try {
                            const productCableResponse = await AddProductCable({
                                ...productCable,
                                productId: productData.id,
                            });

                            if (productCableResponse.status !== 204) {
                                falseUpdate.push(productCable);
                            }
                        } catch (productCableError) {
                            falseUpdate.push(productCable);
                            console.error(productCableError);
                        }
                    }

                    if (Object.keys(productPhone).length > 0) {
                        try {
                            const productPhoneResponse = await AddProductPhone({
                                ...productPhone,
                                productId: productData.id,
                            });

                            if (productPhoneResponse.status !== 204) {
                                falseUpdate.push(productPhone);
                            }
                        } catch (productPhoneError) {
                            falseUpdate.push(productPhone);
                            console.error(productPhoneError);
                        }
                    }

                    if (Object.keys(productBackupCharger).length > 0) {
                        try {
                            const productBackupChargerResponse = await AddProductBackupCharger({
                                ...productBackupCharger,
                                productId: productData.id,
                            });

                            if (productBackupChargerResponse.status !== 204) {
                                falseUpdate.push(productBackupCharger);
                            }
                        } catch (productBackupChargerError) {
                            falseUpdate.push(productBackupCharger);
                            console.error(productBackupChargerError);
                        }
                    }

                    if (Object.keys(productAdapter).length > 0) {
                        try {
                            const productAdapterResponse = await AddProductAdapter({
                                ...productAdapter,
                                productId: productData.id,
                            });

                            if (productAdapterResponse.status !== 204) {
                                falseUpdate.push(productAdapter);
                            }
                        } catch (productAdapterError) {
                            falseUpdate.push(productAdapter);
                            console.error(productAdapterError);
                        }
                    }

                    if (Object.keys(productImage).length > 0) {
                        try {
                            productImage.map(async (item) => {
                                try {
                                    delete item.id;
                                    const productImageResponse = await AddImageDetail(item);
                                    if (productImageResponse.status !== 204) {
                                        falseUpdate.push(item);
                                    }
                                } catch (productImageError) {
                                    falseUpdate.push(item);
                                    console.error(productImageError);
                                }
                            });
                        } catch (e) {
                            falseUpdate.push(productImage);
                            console.error(e);
                        }
                    }

                } else {
                    alert("Thêm sản phẩm thất bại!");
                    return;
                }
            } catch (productUpdateError) {
                alert("Thêm sản phẩm thất bại!");
                console.error(productUpdateError);
            }

            if (falseUpdate.length > 0) {
                alert("Thêm sản phẩm thất bại! " + falseUpdate.join(", ").toString());
            } else {
                alert("Thêm sản phẩm thành công!");
                onReload(productData.id, "add");
                onClose();
            }
        } else if (actionType === "edit") {
            let falseUpdate = [];
            try {
                if (productData.image === null) {
                    productData.image = "";
                }
                const productUpdateResponse = await UpdateProduct(productData);
                if (productUpdateResponse.status === 204) {
                    if (productQuantity.length > 0) {
                        await Promise.all(
                            productQuantity.map(async (item) => {
                                if (item.id) {
                                    if (item.isDeleted === true) {
                                        try {
                                            const quantityDeleteResponse = await DeleteProductQuantity(item.id);
                                            if (quantityDeleteResponse.status !== 200) {
                                                falseUpdate.push(item);
                                            }
                                        } catch (quantityDeleteError) {
                                            falseUpdate.push(item);
                                            console.error(quantityDeleteError);
                                        }
                                    } else {
                                        try {
                                            const quantityUpdateResponse = await UpdateProductQuantity(item);
                                            if (quantityUpdateResponse.status !== 200) {
                                                falseUpdate.push(item);
                                            }
                                        } catch (quantityUpdateError) {
                                            falseUpdate.push(item);
                                            console.error(quantityUpdateError);
                                        }
                                    }
                                } else {
                                    try {
                                        const quantityCreateResponse = await UpdateProductQuantity({
                                            productId: productData.id,
                                            color: item.color,
                                            quantity: item.quantity,
                                            sold: 0,
                                        });

                                        if (quantityCreateResponse.status !== 201) {
                                            falseUpdate.push(item);
                                        }
                                    } catch (quantityCreateError) {
                                        falseUpdate.push(item);
                                        console.error(quantityCreateError);
                                    }
                                }
                            })
                        );
                    }


                    if (Object.keys(productCable).length > 0) {
                        if (productCable.id) {
                            try {
                                const productCableResponse = await UpdateProductCable(productCable);
                                if (productCableResponse.status !== 204) {
                                    falseUpdate.push(productCable);
                                }
                            } catch (productCableError) {
                                falseUpdate.push(productCable);
                                console.error(productCableError);
                            }
                        } else {
                            try {
                                const productCableResponse = await AddProductCable({
                                    ...productCable,
                                    productId: productData.id,
                                });

                                if (productCableResponse.status !== 204) {
                                    falseUpdate.push(productCable);
                                }
                            } catch (productCableError) {
                                falseUpdate.push(productCable);
                                console.error(productCableError);
                            }
                        }
                    }

                    if (Object.keys(productPhone).length > 0) {
                        if (productPhone.id) {
                            try {
                                const productPhoneResponse = await UpdateProductPhone(productPhone);
                                if (productPhoneResponse.status !== 204) {
                                    falseUpdate.push(productPhone);
                                }
                            } catch (productPhoneError) {
                                falseUpdate.push(productPhone);
                                console.error(productPhoneError);
                            }
                        } else {
                            try {
                                const productPhoneResponse = await AddProductPhone({
                                    ...productPhone,
                                    productId: productData.id,
                                });

                                if (productPhoneResponse.status !== 204) {
                                    falseUpdate.push(productPhone);
                                }
                            } catch (productPhoneError) {
                                falseUpdate.push(productPhone);
                                console.error(productPhoneError);
                            }
                        }
                    }

                    if (Object.keys(productBackupCharger).length > 0) {
                        if (productBackupCharger.id) {
                            try {
                                const productBackupChargerResponse = await UpdateProductBackupCharger(productBackupCharger);
                                if (productBackupChargerResponse.status !== 204) {
                                    falseUpdate.push(productBackupCharger);
                                }
                            } catch (productBackupChargerError) {
                                falseUpdate.push(productBackupCharger);
                                console.error(productBackupChargerError);
                            }
                        } else {
                            try {
                                const productBackupChargerResponse = await AddProductBackupCharger({
                                    ...productBackupCharger,
                                    productId: productData.id,
                                });

                                if (productBackupChargerResponse.status !== 204) {
                                    falseUpdate.push(productBackupCharger);
                                }
                            } catch (productBackupChargerError) {
                                falseUpdate.push(productBackupCharger);
                                console.error(productBackupChargerError);
                            }
                        }
                    }

                    if (Object.keys(productAdapter).length > 0) {
                        if (productAdapter.id) {
                            try {
                                const productAdapterResponse = await UpdateProductAdapter(productAdapter);

                                if (productAdapterResponse.status !== 204) {
                                    falseUpdate.push(productAdapter);
                                }
                            } catch (productAdapterError) {
                                falseUpdate.push(productAdapter);
                                console.error(productAdapterError);
                            }
                        } else {
                            try {
                                const productAdapterResponse = await AddProductAdapter({
                                    ...productAdapter,
                                    productId: productData.id,
                                });

                                if (productAdapterResponse.status !== 204) {
                                    falseUpdate.push(productAdapter);
                                }
                            } catch (productAdapterError) {
                                falseUpdate.push(productAdapter);
                                console.error(productAdapterError);
                            }
                        }
                    }

                    if (Object.keys(productImage).length > 0) {
                        productImage.map(async (item) => {
                            if (item.id) {
                                if (item.isDeleted === true) {
                                    try {
                                        const productImageResponse = await DeleteImageDetail(item.id);
                                        if (productImageResponse.status !== 200) {
                                            falseUpdate.push(item);
                                        }
                                    } catch (productImageError) {
                                        falseUpdate.push(item);
                                        console.error(productImageError);
                                    }
                                } else {
                                    try {
                                        const productImageResponse = await UpdateImageDetail(item);
                                        if (productImageResponse.status !== 204) {
                                            falseUpdate.push(item);
                                        }
                                    } catch (productImageError) {
                                        falseUpdate.push(item);
                                        console.error(productImageError);
                                    }
                                }
                            } else {
                                try {
                                    delete item.id;
                                    const productImageResponse = await AddImageDetail(item);
                                    if (productImageResponse.status !== 204) {
                                        falseUpdate.push(item);
                                    }
                                } catch (productImageError) {
                                    falseUpdate.push(item);
                                    console.error(productImageError);
                                }
                            }
                        });
                    }
                } else {
                    alert("Sửa sản phẩm thất bại!");
                }
            } catch (productUpdateError) {
                alert("Sửa sản phẩm thất bại!");
                console.error(productUpdateError);
            }

            if (falseUpdate.length > 0) {
                alert("Sửa sản phẩm thất bại! " + falseUpdate.join(", ").toString());
            } else {
                alert("Sửa sản phẩm thành công!");
                onReload(productData.id, "edit");
                onClose();
            }
        }
    };

    const onOpenNewQuantity = async () => {
        setActionOnProductParameter("add");
        setProductQuantityVisible(true);
    }

    const onOpenEditQuantity = () => {
        setActionOnProductParameter("edit");
        setProductQuantity(productQuantity);
        setProductQuantityVisible(true);
    }

    const handleOnSaveProductQuantity = (productQuantityData, productImageData) => {
        setProductQuantity(productQuantityData);
        setProductImage(productImageData);
    }

    const onCloseQuantity = () => {
        setProductQuantityVisible(false);
    }

    const onOpenNewPhone = () => {
        setActionOnProductParameter("add");
        setProductPhoneVisible(true);
    }

    const onOpenEditPhone = () => {
        setActionOnProductParameter("edit");
        setProductPhoneVisible(true);
    }

    const handleOnSaveProductPhone = (productPhoneData) => {
        setProductPhone(productPhoneData);
    }

    const onOpenNewCable = () => {
        setActionOnProductParameter("add");
        setProductCableVisible(true);
    }

    const onOpenEditCable = () => {
        setActionOnProductParameter("edit");
        setProductCable(productCable);
        setProductCableVisible(true);
    }
    const onCloseCable = () => {
        setProductCableVisible(false);
    }

    const handleOnSaveProductCable = (productCableData) => {
        setProductCable(productCableData);
    }

    const onClosePhone = () => {
        setProductPhoneVisible(false);
    }

    const onOpenNewBackupCharger = () => {
        setActionOnProductParameter("add");
        setProductBackupChargerVisible(true);
    }

    const openEditBackupCharger = () => {
        setActionOnProductParameter("edit");
        setProductBackupChargerVisible(true);
    }

    const onCloseBackupCharger = () => {
        setProductBackupChargerVisible(false);
    }

    const handleOnSaveProductBackupCharger = (productBackupChargerData) => {
        setProductBackupCharger(productBackupChargerData);
    }

    const onOpenNewAdapter = () => {
        setActionOnProductParameter("add");
        setProductAdapterVisible(true);
    }

    const openEditAdapter = () => {
        setActionOnProductParameter("edit");
        setProductAdapterVisible(true);
    }

    const onCloseAdapter = () => {
        setProductAdapterVisible(false);
    }

    const handleOnSaveProductAdapter = (productAdapterData) => {
        setProductAdapter(productAdapterData);
    }

    const handleReloadProductCable = () => {
        fetchProductCable(productData.id).then((res) => {
            setProductCable(res);
        });
    }

    const handleReloadProductBackupCharger = () => {
        fetchProductBackupCharger(productData.id).then((res) => {
            setProductBackupCharger(res);
        });
    }

    const handleReloadProductAdapter = () => {
        fetchProductAdapter(productData.id).then((res) => {
            setProductAdapter(res);
        });
    }

    const handleReloadProductPhone = () => {
        fetchProductPhone(productData.id).then((res) => {
            setProductPhone(res);
        });
    }

    const handleValidField = (e) => {
        const {id, value} = e.target;

        setIsValid({
            ...isValid,
            [id]: value !== "",
        })

        const fields = ["name", "price", "preDiscount", "discountPercent", "brand"];
        fields.forEach(field => {
            if (id === field && isValid[`new${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
                setIsValid({
                    ...isValid,
                    [`new${field.charAt(0).toUpperCase() + field.slice(1)}`]: false,
                })
            }
        });
    }

    if (!visible) {
        return null;
    }


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm max-h-screen overflow-y-auto"
        >
            <div className="bg-white p-3 rounded-md">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">
                        Chi tiết sản phẩm
                    </div>
                    <button onClick={onClose}>X</button>
                </div>
                <div className="grid grid-cols-2 gap-5 text-xs md:text-xl lg:text-2xl">
                    <div className="">
                        <label className="" htmlFor="id">ID</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300`}
                               id="id"
                               onChange={(e) => handleOnChange(e)}
                               disabled
                               value={productData.id}/>
                    </div>
                    <div className="">
                        <label className="" htmlFor="name">Tên sản phẩm(*)</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300 ${(isValid.newName) ? "" : (isValid.name) ? "" : "border-red-500"}`}
                               id="name"
                               onChange={(e) => handleOnChange(e)}
                               onBlur={(e) => handleValidField(e)}
                               value={productData.name}/>
                        {
                            (!isValid.name && !isValid.newName) && (
                                <h5 className="text-red-300 text-xs">"Tên sản phẩm không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="price">Giá sản phẩm(*)</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300 ${(isValid.newPrice) ? "" : (isValid.price) ? "" : "border-red-500"}`}
                               id="price"
                               onChange={(e) => handleOnChange(e)}
                               onBlur={(e) => handleValidField(e)}
                               value={productData.price}/>
                        {
                            (!isValid.price && !isValid.newPrice) && (
                                <h5 className="text-red-300 text-xs">"Giá sản phẩm không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="PreDiscount">Giá trước khi giảm giá(*)</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300 ${(isValid.newPreDiscount) ? "" : (isValid.preDiscount) ? "" : "border-red-500"}`}
                               id="PreDiscount"
                               onChange={(e) => handleOnChange(e)}
                               onBlur={(e) => handleValidField(e)}
                               value={productData.preDiscount}/>
                        {
                            (!isValid.preDiscount && !isValid.newPreDiscount) && (
                                <h5 className="text-red-300 text-xs">"Giá trước khi giảm giá không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="discountPercent">Phần trăm giảm giá(*)</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300 ${(isValid.newDiscountPercent) ? "" : (isValid.discountPercent) ? "" : "border-red-500"}`}
                               id="discountPercent"
                               onChange={(e) => handleOnChange(e)}
                               onBlur={(e) => handleValidField(e)}
                               value={productData.discountPercent}/>
                        {
                            (!isValid.discountPercent && !isValid.newDiscountPercent) && (
                                <h5 className="text-red-300 text-xs">"Phần trăm giảm giá không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="brand">Thương hiệu(*)</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300 ${(isValid.newBrand) ? "" : (isValid.brand) ? "" : "border-red-500"}`}
                               id="brand"
                               onChange={(e) => handleOnChange(e)}
                               onBlur={(e) => handleValidField(e)}
                               value={productData.brand}/>
                        {
                            (!isValid.brand && !isValid.newBrand) && (
                                <h5 className="text-red-300 text-xs">"Thương hiệu không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="category">Danh mục</label>
                        <select
                            className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300`}
                            id="category"
                            onChange={(e) => handleOnChange(e)}
                            value={productData.category}
                        >
                            {
                                category.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {categoryNames[item.id] || ""}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="description">Mô tả</label>
                        <textarea
                            className={`border border-black rounded-md text-center block md:w-full disabled:bg-gray-300`}
                            id="description"
                            onChange={(e) => handleOnChange(e)}
                            value={productData.description}/>
                    </div>
                    <div className="col-span-2">
                        <label className="" htmlFor="image">Hình ảnh</label>
                        {
                            productData.image &&
                            <img className={"w-32 h-32"}
                                 src={`data:image/jpeg;base64, ${productData.image}`}
                                 alt={productData.name}/>
                        }
                    </div>
                    <div className="">
                        <input
                            type="file"
                            className="form-control"
                            id="image"
                            onChange={(e) => handleUploadImage(e)}
                        />
                    </div>
                    <div className="">
                        <button
                            className="px-2 py-1 text-white bg-red-400 rounded-md"
                            onClick={(e) => handleOnDeleteImage(e)}
                        >
                            Xoá hình ảnh
                        </button>
                    </div>
                    {
                        (productQuantity.length <= 0) ? (
                                <div className={""}>
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-blue-200 rounded-md"
                                        onClick={onOpenNewQuantity}
                                    >
                                        Thêm số lượng sản phẩm
                                    </button>
                                </div>
                            )
                            :
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-yellow-100 rounded-md"
                                        onClick={onOpenEditQuantity}
                                    >
                                        Sửa số lượng sản phẩm
                                    </button>
                                </div>
                            )
                    }

                    {
                        (Object.keys(productPhone).length === 0) ?
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-blue-200 rounded-md"
                                        onClick={onOpenNewPhone}
                                    >
                                        Thêm thông số điện thoại
                                    </button>
                                </div>
                            )
                            :
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-yellow-100 rounded-md"
                                        onClick={onOpenEditPhone}
                                    >
                                        Sửa thông số điện thoại
                                    </button>
                                </div>
                            )
                    }
                    {
                        (Object.keys(productAdapter).length === 0) ?
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-blue-200 rounded-md"
                                        onClick={onOpenNewAdapter}
                                    >
                                        Thêm thông số sạc
                                    </button>
                                </div>
                            )
                            :
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-yellow-100 rounded-md"
                                        onClick={openEditAdapter}
                                    >
                                        Sửa thông số sạc
                                    </button>
                                </div>
                            )
                    }

                    {
                        (Object.keys(productCable).length === 0) ?
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-blue-200 rounded-md"
                                        onClick={onOpenNewCable}
                                    >
                                        Thêm thông số cáp
                                    </button>
                                </div>
                            )
                            :
                            (
                                <div className="">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-yellow-100 rounded-md"
                                        onClick={onOpenEditCable}
                                    >
                                        Sửa thông số cáp
                                    </button>
                                </div>
                            )
                    }
                    {
                        (Object.keys(productBackupCharger).length === 0) ?
                            (
                                <div className="col-span-2">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-blue-200 rounded-md"
                                        onClick={onOpenNewBackupCharger}
                                    >
                                        Thêm thông số sạc dự phòng
                                    </button>
                                </div>
                            )
                            :
                            (
                                <div className="col-span-2">
                                    <button
                                        className="px-2 py-1 text-black border border-black text-sm bg-yellow-100 rounded-md"
                                        onClick={openEditBackupCharger}
                                    >
                                        Sửa thông số sạc dự phòng
                                    </button>
                                </div>

                            )
                    }
                    <div className="form-group flex justify-end">
                        <button type="button"
                                className="px-2 py-1 text-white bg-green-400 rounded-md"
                                onClick={() => handleOnSave()}>Lưu
                        </button>
                    </div>
                </div>
            </div>

            {
                productQuantityVisible &&
                <ProductQuantity visible={productQuantityVisible} data={productQuantity} onClose={onCloseQuantity}
                                 action={actionOnProductParameter} onSave={handleOnSaveProductQuantity}/>
            }


            {
                productAdapterVisible &&
                <ProductAdapter visible={productAdapterVisible} onClose={onCloseAdapter} data={productAdapter}
                                action={actionOnProductParameter} onSave={handleOnSaveProductAdapter}
                                onReload={handleReloadProductAdapter}/>
            }

            {
                productBackupChargerVisible &&
                <ProductBackupCharger visible={productBackupChargerVisible} onClose={onCloseBackupCharger}
                                      data={productBackupCharger}
                                      action={actionOnProductParameter} onSave={handleOnSaveProductBackupCharger}
                                      onReload={handleReloadProductBackupCharger}/>
            }

            {
                productCableVisible &&
                <ProductCable visible={productCableVisible} onClose={onCloseCable} data={productCable}
                              action={actionOnProductParameter} onSave={handleOnSaveProductCable}
                              onReload={handleReloadProductCable}/>

            }

            {
                productPhoneVisible &&
                <ProductPhone visible={productPhoneVisible} onClose={onClosePhone} data={productPhone}
                              action={actionOnProductParameter} onSave={handleOnSaveProductPhone}
                              onReload={handleReloadProductPhone}/>
            }
        </div>
    )
}