import axios from '../../api/axios';

export const fetchOrders = async () => {
    try {
        const res = await axios.get("/Order");
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const AddOrder = async (orderData) => {
    try {
        const res = await axios.post("/Order", orderData);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const UpdateOrder = async (orderData) => {
    try {
        const res = await axios.put(`/Order/ChangeStatus/${orderData.id}`, orderData);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const fetchOrdersProcessing = async () => {
    try {
        const res = await axios.get("/Order/Processing");
        return res.data;
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export const fetchOrdersTodayCompleted = async () => {
    try {
        const res = await axios.get("/Order/TodayCompleted");
        return res.data;
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export const fetchRevenueToday = async () => {
    try {
        const res = await axios.get("/Order/RevenueToday");
        return res.data;
    } catch (err) {
        console.log(err);
        return 0;
    }
}


export const fetchRevenueMonth = async () => {
    try {
        const res = await axios.get("/Order/RevenueThisMonth");
        return res.data;
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export const fetchRevenueEachDayThisMonth = async () => {
    try {
        const res = await axios.get("/Order/RevenueEachDayThisMonth");
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const fetchTop5Customers = async () => {
    try {
        const res = await axios.get("/Customer/Top5Customers");
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const fetchRevenue = async (startMonth, startYear, endMonth, endYear) => {
    try {
        const res = await axios.get(`/Order/GetMonthlyRevenue?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}`);
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const fetchRevenueByProduct = async (startMonth, startYear, endMonth, endYear, productId) => {
    try {
        const res = await axios.get(`/Order/GetMonthlyRevenueByProduct?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}&productId=${productId}`);
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const fetchProductsSold = async (startMonth, startYear, endMonth, endYear) => {
    try {
        const res = await axios.get(`/Order/GetMonthlyProductsSold?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}`);
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}


export const fetchProductSold = async (startMonth, startYear, endMonth, endYear, productId) => {
    try {
        const res = await axios.get(`/Order/GetMonthlyProductsSold?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}&productId=${productId}`);
        return res.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}


export const getLastId = async () => {
    try {
        const response = await axios.get("/Order/GetLastId");
        return response.data;
    } catch (e) {
        console.log(e);
    }
}