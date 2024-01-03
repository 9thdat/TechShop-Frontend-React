import React, {useState, useEffect} from "react";

export default function ProductImage({visible, onClose, data, action, onSave}) {
    const [productImage, setProductImage] = useState({});
    const [productImages, setProductImages] = useState([]);

    const [length, setLength] = useState(0);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (action === "add") {
            setLength(0);
            setCurrent(0);
            setProductImages([]);
        } else {
            const filteredImages = data.filter(item => !item.isDeleted || false);

            setProductImages(filteredImages.map(item => ({
                id: item.id,
                productId: item.productId,
                color: item.color,
                ordinal: item.ordinal,
                image: item.image,
            })));

            setLength(filteredImages.length);
        }

    }, [data]);


    const handleOnChange = (e) => {
        const {id, value} = e.target;
        setProductImage(
            {
                ...productImage,
                [id]: (id === "ordinal") ? Number(value) : value,
            }
        );

        setProductImages((prevData) =>
            prevData.map((item, i) =>
                i === current - 1 ? {...item, [id]: (id === "ordinal") ? Number(value) : value} : item
            )
        );
    }

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

                setProductImage({
                    ...productImage,
                    image: base64String,
                });

                setProductImages((prevData) =>
                    prevData.map((item, i) =>
                        i === current - 1 ? {...item, image: base64String} : item
                    )
                );
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }

    const handleDisplayImage = (e) => {
        const {value} = e.target;
        if (value === "") {
            setProductImage({
                "id": "",
                "productId": data[0].productId,
                "color": data[0].color,
                "ordinal": "",
                "image": "",
            });
            setCurrent(0);
        } else {
            setCurrent(value);
            setProductImage(productImages[value - 1]);
        }
    }

    const handleAddProductImage = () => {
        setLength(length + 1);
        setCurrent(length + 1);
        setProductImage({
            "id": "",
            "productId": data[0].productId,
            "color": data[0].color,
            "ordinal": "",
            "image": "",
            "new": true,
        });
        setProductImages((prevData) => [
            ...prevData,
            {
                "id": "",
                "productId": data[0].productId,
                "color": data[0].color,
                "ordinal": "",
                "image": "",
                "new": true,
            },
        ]);
    }

    const handleOnDeleteImage = () => {
        setProductImages((prevData) =>
            prevData.map((item, i) =>
                i === current - 1 ? {...item, isDeleted: true} : item
            )
        );
        setLength((prevLength) => prevLength - 1);

        // Update productImage after the state has been updated
        setTimeout(() => {
            setProductImage(productImages[current - 2] || {});
            setCurrent((prevCurrent) => prevCurrent - 1);
        }, 0);
    };

    const validate = () => {
        let valid = true;
        productImages.forEach(item => {
            if (item.ordinal === "" || item.image === "") {
                valid = false;
            }
        });
        return valid;
    }

    const handleOnSave = () => {
        const isValid = validate();
        console.log(isValid);
        if (isValid) {
            onSave(productImages);
            onClose();
        } else {
            alert("Vui lòng nhập đầy đủ thông tin!");
        }
    }

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm max-h-screen overflow-y-auto">
            <div className="bg-white p-3 rounded-md">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">Thông tin hình ảnh</div>
                    <button onClick={() => {
                        onClose();
                    }}>X
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xl md:text-2xl lg:text-3xl ">
                    <div>
                        <label htmlFor={"stt"}>Hình ảnh thứ </label>
                        <select
                            className={`border border-black rounded-md text-center`}
                            id="stt"
                            onChange={(e) => handleDisplayImage(e)}
                            defaultValue={""}
                            value={current}
                        >
                            <option value={""}></option>
                            {
                                length !== null &&
                                Array.from(Array(length + 1).keys())
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
                        <button
                            type="button"
                            className="px-2 py-1 text-black bg-yellow-300 rounded-md text-sm"
                            onClick={handleAddProductImage}
                        >
                            Thêm một hình ảnh
                        </button>
                    </div>
                    <div className="">
                        <label className="" htmlFor="ordinal">Thứ tự</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="ordinal"
                               onChange={(e) => handleOnChange(e)}
                               value={productImage.ordinal}
                               disabled={current === 0}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="" htmlFor="image">Hình ảnh</label>
                        {
                            productImage.image &&
                            <img className={"w-32 h-32"}
                                 src={`data:image/jpeg;base64, ${productImage.image}`}
                                 alt={productImage.color}/>
                        }
                    </div>
                    <div className="col-span-2">
                        <input
                            type="file"
                            className="form-control"
                            id="image"
                            onChange={(e) => handleUploadImage(e)}
                        />
                    </div>
                    {
                        (current !== 0) &&
                        <button
                            type="button"
                            className="px-2 py-1 text-white bg-red-400 rounded-md"
                            onClick={handleOnDeleteImage}
                        >
                            Xóa hình ảnh
                        </button>
                    }
                    <button
                        className="px-2 py-1 text-white bg-green-400 rounded-md"
                        onClick={handleOnSave}>Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

