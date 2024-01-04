import axios from '../../api/axios';

export const fetchUser = async (email) => {
    try {
        const res = await axios.get(`/User/${email}`);
        return res.data;
    } catch (err) {
        console.log(err);
    }
}

export const fetchStaffs = async () => {
    try {
        const res = await axios.get("/User/Staffs");
        return res.data;
    } catch (err) {
        console.log(err);
    }
}

export const AddStaff = async (staff) => {
    try {
        const res = await axios.post("/User/Staff", staff);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const UpdateStaff = async (staff) => {
    try {
        const res = await axios.put("/User/Staffs/Update", staff);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const ValidateStaff = async (email) => {
    try {
        const res = await axios.get(`User/Staffs/Valid/email=${email}`);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const Login = async (email, password) => {
    try {
        const res = await axios.post(`/User/Login`, {
            email: email,
            password: password,
        });
        return res;
    } catch (e) {
        console.log(e);
        if (e.response.status === 404) {
            alert("Người dùng không tồn tại");
        } else if (e.response.status === 401) {
            alert("Sai mật khẩu");
        } else {
            alert("Lỗi không xác định");
        }
    }
}

export const ValidateToken = async (token) => {
    try {
        const res = await axios.post("/User/ValidateToken", {
            token: token,
        });
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const ChangePassword = async (email, newPassword) => {
    try {
        const res = await axios.put(`/User/ChangePassword/email=${email}&newPassword=${newPassword}`);
        return res;
    } catch (e) {
        console.log(e);
        return e.response;
    }
}




