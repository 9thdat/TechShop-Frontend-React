import React, {useEffect, useState} from "react";
import {fetchDiscountByCode} from "../../services/Discount/Discount";

export default function DiscountDetail({
                                           visible,
                                           onClose,
                                           discountData,
                                           handleAddDiscount,
                                           handleEditDiscount,
                                           action
                                       }) {
    const [discount, setDiscount] = useState(discountData);
    const [codeExist, setCodeExist] = useState(false);

    const [isValid, setIsValid] = useState({
        code: false,
        value: false,
        minApply: false,
        maxSpeed: false,
        quantity: false,
        startDate: false,
        endDate: false,
        newCode: true,
        newValue: true,
        newMinApply: true,
        newMaxSpeed: true,
        newQuantity: true,
        newEndDate: true,
        newStartDate: true,
    });

    useEffect(() => {
        setCodeExist(false);
        setDiscount(discountData);
        if (action === "edit") {
            setIsValid({
                code: true,
                value: true,
                minApply: true,
                maxSpeed: true,
                quantity: true,
                startDate: true,
                endDate: true,
                newCode: true,
                newValue: true,
                newMinApply: true,
                newMaxSpeed: true,
                newQuantity: true,
                newEndDate: true,
                newStartDate: true,
            });
        } else {
            setIsValid({
                code: false,
                value: false,
                minApply: true,
                maxSpeed: true,
                quantity: false,
                startDate: true,
                endDate: true,
                newCode: true,
                newValue: true,
                newMinApply: true,
                newMaxSpeed: true,
                newQuantity: true,
                newEndDate: true,
                newStartDate: true,
            });
        }
    }, [discountData]);

    const handleOnChange = async (e) => {
        const {id, value} = e.target;
        setDiscount({
            ...discount,
            [id]: value,
        });
    };

    const handleOnSave = (e) => {
        e.preventDefault();
        if (!isValid.code || !isValid.value || !isValid.minApply || !isValid.maxSpeed || !isValid.quantity || !isValid.startDate || !isValid.endDate || codeExist) {
            alert("Vui lòng nhập đúng thông tin");
            return;
        }
        if (action === "add") {
            handleAddDiscount(discount);
        } else if (action === "edit") {
            handleEditDiscount(discount);
        }
    };

    const handleValidField = async (e) => {
        const id = e.target.id;
        const value = e.target.value;

        setIsValid(prevState => ({
            ...prevState,
            [id]: value !== "" && value !== null && value !== undefined,
        }));

        const fields = ["value", "minApply", "maxSpeed", "quantity"];
        fields.forEach(field => {
            if (id === field && isValid[`new${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
                setIsValid(prevState => ({
                    ...prevState,
                    [`new${field.charAt(0).toUpperCase() + field.slice(1)}`]: false,
                }));
            }
        });
    }


    const handleValidDate = (e) => {
        const {id, value} = e.target;

        if (id === "startDate") {
            setIsValid({
                ...isValid,
                newStartDate: false,
                startDate: value < discount.endDate,
            });
        } else {
            setIsValid({
                ...isValid,
                newEndDate: false,
                endDate: value > discount.startDate,
            });
        }
    }

    const handleValidCode = async (e) => {
        const {id, value} = e.target;

        setIsValid({
            ...isValid,
            newCode: false,
            code: value !== "",
        });

        const res = await fetchDiscountByCode(discount.code);
        if (res.status === 200) {
            setCodeExist(true);
        } else {
            setCodeExist(false);
        }
    }


    if (!visible) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center backdrop-blur-sm text-xs overflow-auto"
        >
            <div className="bg-white p-3 rounded-md">
                <div className="flex justify-between md:text-2xl font-semibold">
                    <div className="">Thông tin mã giảm giá</div>
                    <button onClick={onClose}>X</button>
                </div>
                <div className="grid grid-cols-2 gap-5 text-xs md:text-xl lg:text-2xl">
                    <div className="">
                        <label className="" htmlFor="id">
                            ID
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="id"
                            value={discount.id}
                            disabled={true}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="name">
                            Mã(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md w-full text-center block disabled:bg-gray-300 ${(isValid.newCode) ? "" : (isValid.code) ? ((codeExist) ? "border-red-500" : "") : "border-red-500"}`}
                            id="code"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidCode(e)}
                            value={discount.code}
                        />
                        {
                            !isValid.code && !isValid.newCode &&
                            <h5 className="text-red-300 text-xs">"Mã không hợp lệ"</h5>
                        }
                        {
                            codeExist &&
                            <h5 className="text-red-300 text-xs">"Mã đã tồn tại"</h5>
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="type">
                            Loại
                        </label>
                        <select
                            name={"type"}
                            id={"type"}
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={discount.type}
                        >
                            <option value={"percent"}>Phần trăm</option>
                            <option value={"fixed"}>Tiền mặt</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="value">
                            Trị giá(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300 ${(isValid.newValue) ? "" : (isValid.value) ? "" : "border-red-500"}`}
                            id="value"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={discount.value}
                        />
                        {
                            !isValid.value && !isValid.newValue &&
                            <h5 className="text-red-300 text-xs">"Trị giá không hợp lệ"</h5>
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="startDate">
                            Ngày bắt đầu
                        </label>
                        <input
                            type="date"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="startDate"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidDate(e)}
                            value={discount.startDate}
                        />
                        {
                            !isValid.startDate && !isValid.newStartDate &&
                            <h5 className="text-red-300 text-xs">"Ngày bắt đầu phải bé hơn ngày kết thúc"</h5>
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="endDate">
                            Ngày kết thúc
                        </label>
                        <input
                            type="date"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="endDate"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidDate(e)}
                            value={discount.endDate}
                        />
                        {
                            !isValid.endDate && !isValid.newEndDate &&
                            <h5 className="text-red-300 text-xs">"Ngày kết thúc phải lớn hơn ngày bắt đầu"</h5>
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="status">
                            Tình trạng
                        </label>
                        <select
                            name={"status"}
                            id={"status"}
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            value={discount.status}
                        >
                            <option value={"active"}>Hoạt động</option>
                            <option value={"disable"}>Không hoạt động</option>
                            <option value={"expired"}>Hết hạn</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor="minApply">
                            Giá trị tối thiểu áp dụng(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300 ${(isValid.newMinApply) ? "" : (isValid.minApply) ? "" : "border-red-500"}`}
                            id="minApply"
                            value={discount.minApply}
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                        />
                        {
                            !isValid.minApply && !isValid.newMinApply &&
                            <h5 className="text-red-300 text-xs">"Giá trị tối thiểu áp dụng không hợp lệ"</h5>
                        }
                    </div>
                    <div className="">
                        <label className="m" htmlFor={"maxSpeed"}>
                            Giá trị tối đa được giảm(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300 ${(isValid.newMaxSpeed) ? "" : (isValid.maxSpeed) ? "" : "border-red-500"}`}
                            id="maxSpeed"
                            value={discount.maxSpeed}
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                        />
                        {
                            !isValid.maxSpeed && !isValid.newMaxSpeed &&
                            <h5 className="text-red-300 text-xs">"Giá trị tối đa được giảm không hợp lệ"</h5>
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="quantity">
                            Số lượng(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300 ${(isValid.newQuantity) ? "" : (isValid.quantity) ? "" : "border-red-500"}`}
                            id="quantity"
                            onChange={(e) => handleOnChange(e)}
                            value={discount.quantity}
                            onBlur={(e) => handleValidField(e)}
                        />
                        {
                            !isValid.quantity && !isValid.newQuantity &&
                            <h5 className="text-red-300 text-xs">"Số lượng không hợp lệ"</h5>
                        }
                    </div>
                    <div className="col-span-2">
                        <label className="" htmlFor="description">
                            Mô tả
                        </label>
                        <textarea
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300 w-full`}
                            id="description"
                            onChange={(e) => handleOnChange(e)}
                            value={discount.description}
                        />
                    </div>
                    <div className={"flex justify-end"}>
                        <button
                            className="px-2 py-1 text-white bg-blue-500 rounded-md"
                            onClick={(e) => handleOnSave(e)}
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}