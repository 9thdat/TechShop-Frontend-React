import React, {useEffect, useState} from "react";
import defaultAvatar from "../../assets/images/defaultAvatar/defaultAvatar.jpeg"
import StaffPassword from "./StaffPassword";
import {ChangePassword, ValidateStaff} from "../../services/User/User";

const tinh_tp = require("../../Models/Address/tinh-tp.json");
const quan_huyen = require("../../Models/Address/quan-huyen.json");
const xa_phuong = require("../../Models/Address/xa-phuong.json");

export default function StaffDetail({visible, onClose, staffData, action, handleAddStaff, handleEditStaff}) {
    const [staff, setStaff] = useState({
        email: "",
        name: "",
        password: "",
        phone: "",
        image: "",
        birthday: new Date().toISOString().split('T')[0],
        gender: "Nam",
        status: "active",
        ward: "Phường Tân Định",
        district: "Quận 1",
        city: "Thành phố Hồ Chí Minh",
        address: "",
        role: "staff",
        cityCode: 79,
        districtCode: 760,
    });

    const [cities, setCities] = useState(tinh_tp);
    const [districts, setDistricts] = useState(quan_huyen);
    const [wards, setWards] = useState(xa_phuong);

    const [isNewEmail, setIsNewEmail] = useState(true);
    const [visibleStaffPassword, setVisibleStaffPassword] = useState(false);
    const [isValid, setIsValid] = useState({
        email: false,
        password: false,
        name: false,
        phone: false,
        address: false,
        newEmail: true,
        newPassword: true,
        newName: true,
        newPhone: true,
        newAddress: true,
    });

    useEffect(() => { // Set staff data
        if (action === "add") {
            const newStaff = {
                email: "",
                name: "",
                password: "",
                phone: "",
                image: "",
                birthday: new Date().toISOString().split('T')[0],
                gender: "Nam",
                status: "active",
                ward: "Phường Tân Định",
                district: "Quận 1",
                city: "Thành phố Hồ Chí Minh",
                address: "",
                role: "staff",
                cityCode: 79,
                districtCode: 760,
            };

            setStaff(newStaff);

            setIsValid({
                email: false,
                password: false,
                name: false,
                phone: false,
                address: false,
                newEmail: true,
                newPassword: true,
                newName: true,
                newPhone: true,
                newAddress: true,
            });
        } else if (action === "detail") {
            setStaff((prevStaff) => {
                const newCity = cities.find((tinh) => tinh.name === staffData.city);
                const newDistrict = districts.find((quan) => quan.parent_code === newCity?.code);
                return {
                    ...prevStaff,
                    email: staffData.email,
                    name: staffData.name,
                    password: staffData.password,
                    phone: staffData.phone,
                    image: staffData.image,
                    gender: staffData.gender,
                    status: staffData.status,
                    address: staffData.address,
                    ward: staffData.ward,
                    city: staffData.city,
                    district: staffData.district,
                    role: staffData.role,
                    birthday: staffData.birthday ? staffData.birthday.split('T')[0] : "",
                    cityCode: newCity?.code,
                    districtCode: newDistrict?.code,
                };
            });

            setIsValid({
                email: true,
                password: true,
                name: true,
                phone: true,
                address: true,
                newEmail: true,
                newPassword: true,
                newName: true,
                newPhone: true,
                newAddress: true,
            });
        }
        setIsNewEmail(true);
    }, [staffData, action]);

    const handleOnChange = (e) => {
        const {id, value} = e.target;

        if (id === "city") {
            const newCity = cities.find((tinh) => tinh.name === value);
            const newDistrict = districts.find((quan) => quan.parent_code === newCity?.code);
            const newWard = wards.find((xa) => xa.parent_code === newDistrict?.code);

            setStaff((prevStaff) => ({
                ...prevStaff,
                city: value,
                cityCode: newCity?.code,
                districtCode: newDistrict?.code,
                district: newDistrict?.name,
                ward: newWard?.name,
            }));
        } else if (id === "district") {
            const newDistrict = districts.find((quan) => quan.name === value);
            const newWard = wards.find((xa) => xa.parent_code === newDistrict?.code);

            setStaff((prevStaff) => ({
                ...prevStaff,
                district: value,
                districtCode: newDistrict?.code,
                ward: newWard?.name,
            }));
        }
        else if (id === "image") {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setStaff({
                    ...staff,
                    image: reader.result,
                });
            }
        }
        reader.readAsDataURL(e.target.files[0]);
        }else {
            setStaff((prevStaff) => ({
                ...prevStaff,
                [id]: value,
            }));
        }
    }

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleValidEmail = async (e) => {
        const value = e.target.value;
        const isValid = isValidEmail(value);
        setIsValid((prevIsValid) => ({
            ...prevIsValid,
            newEmail: false,
            email: isValid,
        }));
        if (!isValid) {
            return;
        }
        try {
            const res = await ValidateStaff(value);
            if (res.status === 200) {
                setIsNewEmail(true);
            }
        } catch (e) {
            console.log(e);
            setIsNewEmail(false);
        }
    }

    const handleOnSave = (e) => {
        e.preventDefault();
        if (!isValid.email || !isValid.password || !isValid.name || !isValid.phone || !isValid.address || !isNewEmail) {
            alert("Vui lòng nhập đúng thông tin!");
            return;
        }
        if (staff.image !== "") {
            staff.image = staff.image.split(',')[1];
        } else {
            staff.image = "";
        }

        if (action === "add") {
            handleAddStaff(staff);
        } else if (action === "detail") {
            handleEditStaff(staff);
        }
    }

    const handleOnOpenStaffPassword = () => {
        setVisibleStaffPassword(true);
    }

    const handleCloseStaffPassword = () => {
        setVisibleStaffPassword(false);
    }

    const handleChangePassword = async (newPassword) => {
        try {
            const response = await ChangePassword(staff.email, newPassword);
            if (response.status === 204) {
                alert("Đổi mật khẩu thành công");
                setVisibleStaffPassword(false);
            }
        } catch (e) {
            alert("Đổi mật khẩu thất bại");
        }
    }

    const handleOnDeletePicture = (e) => {
        e.preventDefault();
        setStaff((prevStaff) => ({
            ...prevStaff,
            image: "",
        }));
    }

    const handleValidField = (e) => {
        const {id, value} = e.target;

        setIsValid((prevIsValid) => ({
            ...prevIsValid,
            [id]: value !== "",
        }));

        const fields = ["email", "password", "name", "address", "phone"];
        fields.forEach((field) => {
            if (id === field && isValid[`new${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
                setIsValid((prevIsValid) => ({
                    ...prevIsValid,
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
                    <div className="">Thông tin nhân viên</div>
                    <button onClick={onClose}>X</button>
                </div>
                <div className="grid grid-cols-2 gap-5 text-xs md:text-xl lg:text-2xl">
                    <div className="">
                        <label className="" htmlFor="id">
                            Email(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center w-full block disabled:bg-gray-300 ${(isValid.newEmail) ? "" : (isValid.email) ? ((!isNewEmail) ? "border-red-500" : "") : "border-red-500"}`}
                            id="email"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidEmail(e)}
                            value={staff.email}
                            disabled={action === "detail"}
                        />
                        {(!isNewEmail) && (
                            <h5 className="text-red-300 text-xs">"Email đã tồn tại"</h5>
                        )}
                        {
                            (!isValid.email && !isValid.newEmail) && (
                                <h5 className="text-red-300 text-xs">"Email không hợp lệ"</h5>
                            )
                        }
                    </div>
                    {
                        action === "add" &&
                        <div className="">
                            <label className="" htmlFor="password">
                                Mật khẩu(*)
                            </label>
                            <input
                                type="password"
                                className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newPassword) ? "" : (isValid.password) ? "" : "border-red-500"}`}
                                id="password"
                                onChange={(e) => handleOnChange(e)}
                                onBlur={(e) => handleValidField(e)}
                                value={staff.password}
                            />
                            {
                                (!isValid.password && !isValid.newPassword) && (
                                    <h5 className="text-red-300 text-xs">"Mật khẩu không hợp lệ"</h5>
                                )
                            }
                        </div>
                    }
                    <div className="">
                        <label className="" htmlFor="name">
                            Tên(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newName) ? "" : (isValid.name) ? "" : "border-red-500"}`}
                            id="name"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={staff.name}
                        />
                        {
                            (!isValid.name && !isValid.newName) && (
                                <h5 className="text-red-300 text-xs">"Tên không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="phone">
                            Số điện thoại(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newPhone) ? "" : (isValid.phone) ? "" : "border-red-500"}`}
                            id="phone"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={staff.phone}
                        />
                        {
                            (!isValid.phone && !isValid.newPhone) && (
                                <h5 className="text-red-300 text-xs">"Số điện thoại không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="birthday">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            id="birthday"
                            onChange={(e) => handleOnChange(e)}
                            value={staff.birthday}
                        />
                    </div>
                    <div className="">
                        <label className="" htmlFor="gender">
                            Giới tính
                        </label>
                        <select
                            name={"gender"}
                            id={"gender"}
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            defaultValue={staff.gender}
                        >
                            <option value={"Nam"}>Nam</option>
                            <option value={"Nữ"}>Nữ</option>
                        </select>
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
                            value={staff.status}
                        >
                            <option value={"active"}>Hoạt động</option>
                            <option value={"inactive"}>Không hoạt động</option>
                        </select>
                    </div>
                    <div className="">
                        <label className="" htmlFor=" address">
                            Địa chỉ(*)
                        </label>
                        <input
                            type="text"
                            className={`border border-black rounded-md text-center block w-full disabled:bg-gray-300 ${(isValid.newAddress) ? "" : (isValid.address) ? "" : "border-red-500"}`}
                            id="address"
                            onChange={(e) => handleOnChange(e)}
                            onBlur={(e) => handleValidField(e)}
                            value={staff.address}
                        />
                        {
                            (!isValid.address && !isValid.newAddress) && (
                                <h5 className="text-red-300 text-xs">"Địa chỉ không hợp lệ"</h5>
                            )
                        }
                    </div>
                    <div className="">
                        <label className="" htmlFor="city">
                            Tỉnh/Thành phố
                        </label>
                        <select
                            name={"city"}
                            id={"city"}
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            defaultValue={"staffCity"}
                        >
                            <option
                                id={"staffCity"}
                                value={staff.city}
                            >
                                {staff.city}
                            </option>
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
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            defaultValue={"staffDistrict"}
                        >
                            {(staffData.city === staff.city) &&
                                <option
                                    id={"staffDistrict"}
                                    value={staff.district}
                                >
                                    {staff.district}
                                </option>
                            }
                            {
                                districts.map((quan) => (quan.parent_code === staff.cityCode) && (
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
                            className={`border border-black rounded-md text-center block disabled:bg-gray-300`}
                            onChange={(e) => handleOnChange(e)}
                            defaultValue={"staffWard"}
                        >
                            {(staffData.district === staff.district && staffData.city === staff.city) &&
                                <option
                                    id={"StaffWard"}
                                    value={staff.ward}
                                >
                                    {staff.ward}
                                </option>}
                            {
                                wards.map((ward) => (
                                    (ward.parent_code === staff.districtCode) &&
                                    <option key={ward.code}
                                            value={ward.name}
                                    >
                                        {ward.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className={"col-span-2"}>
                        <label className="" htmlFor="image">
                            Ảnh đại diện
                        </label>
                        <img
                            src={
                                action === "detail" ?
                                    staff.image ? `data:image/jpeg;base64, ${staff.image}` : defaultAvatar
                                    :
                                    staff.image ? staff.image : defaultAvatar
                            }
                            alt="avatar"
                            className="w-24 h-24 rounded-full mx-auto"
                        />
                    </div>
                    <div>
                        {
                            <input
                                type="file"
                                className=""
                                id="image"
                                onChange={(e) => handleOnChange(e)}
                            />
                        }
                    </div>
                    <div className={"flex justify-end"}>
                        <button
                            className="px-2 py-1 ml-2 text-white bg-red-400 rounded-md"
                            onClick={(e) => handleOnDeletePicture(e)}
                        >
                            Xoá ảnh
                        </button>
                    </div>
                    <div>
                        {action === "detail" ? (
                            <button
                                className="px-2 py-1 text-white bg-green-400 rounded-md"
                                onClick={handleOnOpenStaffPassword}
                            >
                                Đổi mật khẩu
                            </button>
                        ) : null}
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
            <StaffPassword visible={visibleStaffPassword} onClose={handleCloseStaffPassword}
                           staffEmail={staff.email}
                           handleChangePassword={handleChangePassword}/>
        </div>
    );
}