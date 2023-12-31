import React, {useState, useEffect} from "react";
import ConfirmDeleteProductParameter from "./ConfirmDeleteProductParameter";
import {DeleteProductAdapter} from "../../services/Product/ProductAdapter";

export default function ProductAdapter({visible, onClose, onSave, data, action, onReload}) {
    const [productAdapter, setProductAdapter] = useState({
        id: "",
        model: "",
        function: "",
        input: "",
        output: "",
        maximum: "",
        size: "",
        tech: "",
        madein: "",
        brandof: "",
        brand: "",
    });
    const [visibleConfirmDelete, setVisibleConfirmDelete] = useState(false);

    useEffect(() => {
        setProductAdapter(data);
    }, [data]);

    const handleOnChange = (e) => {
        const {id, value} = e.target;
        setProductAdapter(
            {
                ...productAdapter,
                [id]: value
            }
        );
    }

    const handleOnSave = () => {
        onSave(productAdapter);
        onClose();
    }

    const handleOpenDelete = () => {
        setVisibleConfirmDelete(true);
    }

    const handleOnDelete = async () => {
        try {
            const res = await DeleteProductAdapter(productAdapter.id);
            if (res.status === 204) {
                alert("Xóa thông số cục sạc thành công!");
                onReload();
                setVisibleConfirmDelete(false);
                onClose();
            } else {
                alert("Xóa thông số cục sạc thất bại!");
                setVisibleConfirmDelete(false);
            }
        } catch (e) {
            alert("Xóa thông số cục sạc thất bại!");
            console.log(e);
            setVisibleConfirmDelete(false);
        }
    }

    const handleOnAbortDelete = () => {
        setVisibleConfirmDelete(false);
    }

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm max-h-screen overflow-y-auto">
            <div className="bg-white p-4 rounded">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">Chi tiết thông số cục sạc</div>
                    <button onClick={() => {
                        onClose();
                    }}>X
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-5 text-xs md:text-xl">
                    <div className="">
                        <label className="mr-2" htmlFor="model">Model</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="model"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.model}/>
                    </div>
                    <div className="">
                        <label className="mr-2" htmlFor="function">Tính năng</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="function"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.function}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="input">Đầu vào</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="input"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.input}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="output">Đầu ra</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="output"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.output}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="maximum">Công suất</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="maximum"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.maximum}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="size">Kích thước</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="size"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.size}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="tech">Công nghệ</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="tech"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.tech}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="madein">Nước sản xuất</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="madein"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.madein}/>
                    </div>
                    <div className="">
                        <label className="mr-2" htmlFor="brandof">Nhà phân phối</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="brandof"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.brandof}/>
                    </div>
                    <div className="">


                        <label className="mr-2" htmlFor="brand">Hãng</label>
                        <input type="text"
                               className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                               id="brand"
                               onChange={(e) => handleOnChange(e)}
                               value={productAdapter.brand}/>
                    </div>
                    <div className="">
                        {
                            !productAdapter.new &&
                            <button
                                type="button"
                                className="px-2 py-1 text-black border border-black text-sm bg-red-300 rounded-md"
                                onClick={handleOpenDelete}
                            >
                                Xoá thông số cục sạc
                            </button>
                        }
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="px-2 py-1 text-black border border-black text-sm bg-green-400 rounded-md"
                            onClick={() => handleOnSave()}
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
            {
                visibleConfirmDelete &&
                <ConfirmDeleteProductParameter visible={visibleConfirmDelete} onAbortDelete={handleOnAbortDelete}
                                               onDelete={handleOnDelete}/>
            }
        </div>
    );
}