import React, {useState, useEffect, useRef} from "react";
import ConfirmDeleteProductParameter from "./ConfirmDeleteProductParameter";
import {DeleteProductCable} from "../../services/Product/ProductCable";

export default function ProductCable({visible, onClose, data, action, onSave, onReload}) {
    const [productCable, setProductCable] = useState({
        id: "",
        tech: "",
        function: "",
        input: "",
        output: "",
        length: "",
        maximum: "",
        madein: "",
        brandof: "",
        brand: "",
    });
    const [visibleConfirmDelete, setVisibleConfirmDelete] = useState(false);

    useEffect(() => {
        setProductCable(data);
    }, [data]);

    const handleOnChange = (e) => {
        const {id, value} = e.target;
        setProductCable(
            {
                ...productCable,
                [id]: value
            }
        );
    }

    const handleOnSave = () => {
        onSave(productCable);
        onClose();
    }

    const handleOpenDelete = () => {
        setVisibleConfirmDelete(true);
    }

    const handleOnDelete = async () => {
        try {
            const res = await DeleteProductCable(productCable.id);
            if (res.status === 204) {
                alert("Xóa thông số cáp thành công!");
                onReload();
                setVisibleConfirmDelete(false);
                onClose();
            } else {
                alert("Xóa thông số cáp thất bại!");
                setVisibleConfirmDelete(false);
            }
        } catch (e) {
            alert("Xóa thông số cáp thất bại!");
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
            <div className="bg-white p-3 rounded-md">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">Chi tiết thông số cáp</div>
                    <button onClick={() => {
                        onClose();
                    }}>X
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:text-xl lg:text-2xl">
                    <div>
                        <label htmlFor="tech" className={""}>Công nghệ</label>
                        <input
                            type="text"
                            name="tech"
                            id="tech"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.tech}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="function" className={""}>Tính năng</label>
                        <input
                            type="text"
                            name="function"
                            id="function"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.function}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="input" className={""}>Đầu vào</label>
                        <input
                            type="text"
                            name="input"
                            id="input"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.input}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="output" className={""}>Đầu ra</label>
                        <input
                            type="text"
                            name="output"
                            id="output"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.output}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="length" className={""}>Chiều dài</label>
                        <input
                            type="text"
                            name="length"
                            id="length"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.length}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="maximum" className={""}>Công suất</label>
                        <input
                            type="text"
                            name="maximum"
                            id="maximum"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.maximum}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="madein" className={""}>Nước sản xuất</label>
                        <input
                            type="text"
                            name="madein"
                            id="madein"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.madein}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div>
                        <label htmlFor="brandof" className={""}>Nhà phân phối</label>
                        <input
                            type="text"
                            name="brandof"
                            id="brandof"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.brandof}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div className={"md:col-span-2"}>
                        <label htmlFor="brand" className={""}>Hãng</label>
                        <input
                            type="text"
                            name="brand"
                            id="brand"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            value={productCable.brand}
                            onChange={(e, index) => handleOnChange(e)}
                        />
                    </div>
                    <div className="">
                        {
                            !productCable.new &&
                            <button
                                className="px-2 py-1 text-black border border-black text-sm bg-red-300 rounded-md"
                                onClick={handleOpenDelete}
                            >
                                Xoá thông số cáp
                            </button>
                        }
                    </div>
                    <div className="md:flex md:justify-end">
                        <button
                            className="px-2 py-1 text-black border border-black text-sm bg-green-400 rounded-md"
                            onClick={handleOnSave}
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
    )
}