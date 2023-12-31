import axios from '../../api/axios';

export const fetchOrderDetail = async (orderId) => {
    try {
        const response = await axios.get(`/OrderDetail/OrderId=${orderId}`);
        return response.data;
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const AddOrderDetail = async (order) => {
    try {
        const res = await axios.post("/OrderDetail", order);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}

export const CancelOrderDetail = async (orderData) => {
    try {
        const res = await axios.put(`/OrderDetail/CancelOrder/${orderData.id}`);
        return res;
    } catch (e) {
        console.log(e);
        return (e.res);
    }
}
