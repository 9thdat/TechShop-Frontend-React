import React, {useState, useEffect} from "react";
import LineChart from "../Charts/LineChart";
import defaultAvatar from "../../assets/images/defaultAvatar/defaultAvatar.jpeg";
import {
    fetchOrdersProcessing, fetchOrdersTodayCompleted,
    fetchRevenueEachDayThisMonth,
    fetchRevenueMonth, fetchRevenueToday,
    fetchTop5Customers
} from "../../services/Order/Order";

export default function Home() {
    const [ordersProcessing, setOrdersProcessing] = useState(0);
    const [ordersTodayCompleted, setOrdersTodayCompleted] = useState(0);
    const [revenueToday, setRevenueToday] = useState(0);
    const [revenueMonth, setRevenueMonth] = useState(0);

    const [revenueEachDayThisMonth, setRevenueEachDayThisMonth] = useState();
    const [TopCustomer, setTopCustomer] = useState();
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Doanh thu",
                data: [],
                backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                borderColor: ["rgba(255, 99, 132, 1)"],
                borderWidth: 1,
            },
        ],
    });


    useEffect(() => {
        sessionStorage.setItem("menu", "home");
    }, []);

    useEffect(() => {
        fetchOrdersProcessing().then((res) => {
            setOrdersProcessing(res);
        });
    }, []);

    useEffect(() => {
        fetchOrdersTodayCompleted().then((res) => {
            setOrdersTodayCompleted(res);
        });
    }, []);

    useEffect(() => {
        fetchRevenueToday().then((res) => {
            let number = res;
            let formattedNumber = number.toLocaleString('vi-VI');
            setRevenueToday(formattedNumber);
        });
    }, []);

    useEffect(() => {
        fetchRevenueMonth().then((res) => {
            let number = res;
            let formattedNumber = number.toLocaleString('vi-VI');
            setRevenueMonth(formattedNumber);
        });
    }, []);

    useEffect(() => {
        fetchRevenueEachDayThisMonth().then((res) => {
            setRevenueEachDayThisMonth(res);
        });
    }, []);

    useEffect(() => {
        if (revenueEachDayThisMonth && revenueEachDayThisMonth.length > 0) {
            setChartData({
                labels: revenueEachDayThisMonth.map((item) => item.day),
                datasets: [
                    {
                        label: "Doanh thu",
                        data: revenueEachDayThisMonth.map((item) => item.revenue),
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.2)",
                        ],
                        borderColor: [
                            "rgba(255, 99, 132, 1)",
                        ],
                        borderWidth: 1,
                    },
                ],
            });
        }
    }, [revenueEachDayThisMonth]);

    useEffect(() => {
        fetchTop5Customers().then((res) => {
            setTopCustomer(res);
        });
    }, []);

    return (
        <div className={"home md:grid md:grid-cols-4 grid-rows-6 w-full h-[90vh] overflow-auto"}>
            <div
                className="col-start-1 row-start-1 md:col-end-5 md:row-end-2 lg:grid lg:grid-cols-4 flex flex-row items-center justify-center text-center text-sm px-4">
                <div
                    className="inline-block text-xs w-full lg:w-full lg:h-full lg:m-auto lg:flex lg:col-start-1 lg:col-end-3 "
                >
                    <div
                        className="bg-red-300 border rounded-xl py-2 md:text-base lg:mb-2 lg:flex lg:flex-col lg:col-start-1 lg:col-end-2 lg:items-center lg:justify-center w-full lg:text-xl "
                    >
                        <span className="">ĐƠN HÀNG CHỜ XỬ LÝ</span>
                        <div className="pl-1 inline-block md:block">
                            {ordersProcessing}
                        </div>
                    </div>
                    <div
                        className="bg-green-400 border rounded-xl py-2 md:text-base lg:mb-2 lg:flex lg:flex-col lg:col-start-2 lg:col-end-3 lg:items-center lg:justify-center w-full lg:text-xl"
                    >
                        <span className="">
                            ĐƠN HÀNG HOÀN THÀNH HÔM NAY
                        </span>
                        <div className="pl-1 inline-block md:block">
                            {ordersTodayCompleted}
                        </div>
                    </div>
                </div>
                <div
                    className="inline-block text-xs w-full lg:w-full lg:h-full lg:m-auto lg:flex lg:col-start-3 lg:col-end-5"
                >
                    <div
                        className="bg-blue-300 border rounded-xl py-2 md:text-base lg:mb-2 lg:col-start-3 lg:col-end-4 lg:flex lg:flex-col lg:items-center lg:justify-center w-full lg:text-xl"
                    >
                        <span className="">DOANH THU HÔM NAY</span>
                        <div className="inline-block pl-1 md:block">{revenueToday}</div>
                    </div>
                    <div
                        className="bg-yellow-200 border rounded-xl py-2 md:text-base lg:mb-2 lg:col-start-4 lg:col-end-5 lg:flex lg:flex-col lg:items-center lg:justify-center w-full lg:text-xl"
                    >
                        <span className="">DOANH THU THÁNG NÀY</span>
                        <div className="inline-block pl-1 md:block">{revenueMonth}</div>
                    </div>
                </div>
            </div>

            {chartData && chartData.labels && (
                <div
                    className="col-start-1 row-start-2 md:col-end-6 md:row-end-5 lg:col-end-4 lg:row-end-7 text-center text-sm md:text-xl mt-3 md:pt-2">
                    <span className="lg:text-xl font-semibold">BIỂU ĐỒ DOANH THU THÁNG NÀY</span>
                    <LineChart chartData={chartData}/>
                </div>
            )}

            <div
                className="col-start-1 row-start-4 md:row-start-5 md:col-end-5 lg:row-start-2 lg:col-start-4 lg:col-end-6 text-center text-xs md:text-base mt-3 md:pt-2">
                <span className="lg:text-xl font-semibold ">TOP KHÁCH HÀNG</span>
                <div className="flex items-center justify-center">
                    <table
                        className="w-full text-sm text-left rtl:text-right text-gray-500"
                    >
                        <thead className="">
                        <tr className={""}>
                            <th scope="col" className="text-center">
                                STT
                            </th>
                            <th scope="col" className="text-center">
                                Ảnh
                            </th>
                            <th scope="col" className="text-center">
                                Tên khách hàng
                            </th>
                            <th scope="col" className="text-center">
                                Số điện thoại
                            </th>
                            <th scope="col" className="hidden xl:block text-center">
                                Tổng tiền
                            </th>
                        </tr>
                        </thead>
                        <tbody className="">
                        {TopCustomer && TopCustomer.length > 0 && TopCustomer.map((item, index) => (
                            <tr key={index} className={""}>
                                <td className="pb-3 lg:pb-6 text-center">{index + 1}</td>
                                <td className="text-center">
                                    <img
                                        className="w-10"
                                        src={item.image ? `data:image/jpeg;base64, ${item.image}` : defaultAvatar}
                                        alt=""
                                    />
                                </td>
                                <td className="text-center">{item.name}</td>
                                <td className="text-center">{item.phone}</td>
                                <td className="hidden xl:block text-center">{item.revenue.toLocaleString('vi-VI')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
