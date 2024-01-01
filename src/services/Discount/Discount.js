import axios from '../../api/axios'

export const fetchDiscounts = async () => {
    try {
        const response = await axios.get("/Discount");
        return response.data;
    } catch (e) {
        console.error(e.message);
        return {
            data: []
        };
    }
}

export const AddDiscount = async (discount) => {
    try {
        const response = await axios.post("/Discount", discount);
        return response;
    } catch (e) {
        console.log(e);
        return {
            status: 400
        };
    }
}

export const UpdateDiscount = async (discount) => {
    try {
        const response = await axios.put("Discount", discount);
        return response;
    } catch (e) {
        console.log(e);
        return {
            status: 400
        };
    }
}

export const fetchLastDiscountId = async () => {
    try {
        const response = await axios.get("/Discount/GetLastId");
        return response;
    } catch (e) {
        console.error(e.message);
        return {
            data: ""
        };
    }
}
export const fetchDiscountCodeById = async (id) => {
    if (id === null) return "";
    try {
        const response = await axios.get(`/Discount/${id}`);
        return response.data;
    } catch (e) {
        console.log(e);
        return "";
    }
}

export const fetchDiscountByCode = async (code) => {
    if (!code) return;
    try {
        const response = await axios.get(`/Discount/Code=${code}`);
        return response;
    } catch (e) {
        console.error(e.message);
        return e.response;
    }
}