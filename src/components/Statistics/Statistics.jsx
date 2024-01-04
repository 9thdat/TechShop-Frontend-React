import React, {useEffect, useState} from "react";
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import {parseISO} from 'date-fns';
import LineChart from "../Charts/LineChart";
import PieChart from "../Charts/PieChart";
import {Line} from "react-chartjs-2";
import {fetchProductSold, fetchProductsSold, fetchRevenue, fetchRevenueByProduct} from "../../services/Order/Order";

export default function Statistics() {
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
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [chartType, setChartType] = useState("MonthRevenue");
    const [productId, setProductId] = useState("");
    const [chartTitle, setChartTitle] = useState("");

    const [productsSold, setProductsSold] = useState([]);
    const [revenue, setRevenue] = useState([]);


    useEffect(() => {
        sessionStorage.setItem("menu", "statistics");
    }, []);

    useEffect(() => {
        const currentDate = new Date();
        const formattedFromDate = new Date(currentDate.getFullYear(), 0, 1);
        setFromDate(formattedFromDate);
    }, []);

    useEffect(() => {
        const currentDate = new Date();
        const formattedToDate = new Date(currentDate.getFullYear(), 11, 31);
        setToDate(formattedToDate);
    }, []);

    const handleAnalyze = async () => {
        const chartTypeText = chartType === "MonthRevenue" ? "Doanh thu" : "Số lượng sản phẩm bán ra";
        const startMonth = fromDate.getMonth() + 1;
        const startYear = fromDate.getFullYear();
        const endMonth = toDate.getMonth() + 1;
        const endYear = toDate.getFullYear();
        setChartTitle("BIỂU ĐỒ " + chartTypeText.toUpperCase() + " TỪ NGÀY " + format(new Date(fromDate), 'dd/MM/yyyy') + " ĐẾN NGÀY " + format(new Date(toDate), 'dd/MM/yyyy'));
        if (chartType === "MonthRevenue") {
            if (productId === "") {
                const revenueData = await fetchRevenue(startMonth, startYear, endMonth, endYear);
                setRevenue(revenueData);
            } else {
                const revenueData = await fetchRevenueByProduct(startMonth, startYear, endMonth, endYear, productId);
                setRevenue(revenueData);
            }
        } else {
            if (productId === "") {
                const productsSoldData = await fetchProductsSold(startMonth, startYear, endMonth, endYear);
                setProductsSold(productsSoldData);
            } else {
                const productsSoldData = await fetchProductSold(startMonth, startYear, endMonth, endYear, productId);
                setProductsSold(productsSoldData);
            }
        }
    }

    useEffect(() => {
        if (revenue && revenue.length > 0) {
            const chartTypeText = chartType === "MonthRevenue" ? "Doanh thu" : "Số lượng sản phẩm bán ra";
            setChartData({
                labels: revenue.map((item) => item.date),
                datasets: [
                    {
                        label: chartTypeText,
                        data: revenue.map((item) => item.revenue),
                        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                        borderColor: ["rgba(255, 99, 132, 1)"],
                        borderWidth: 1,
                    },
                ],
            })
        }
    }, [revenue]);

    useEffect(() => {
        if (productsSold && productsSold.length > 0) {
            const chartTypeText = chartType === "MonthRevenue" ? "Doanh thu" : "Số lượng sản phẩm bán ra";
            setChartData({
                labels: productsSold.map((item) => item.date),
                datasets: [
                    {
                        label: chartTypeText,
                        data: productsSold.map((item) => item.productsSold),
                        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                        borderColor: ["rgba(255, 99, 132, 1)"],
                        borderWidth: 1,
                    },
                ],
            })
        }
    }, [productsSold]);

    return (
        <div className="">
            <div
                className="top-0 right-0 backdrop-blur-sm grid grid-rows-7 lg:grid-cols-6 gap-2 lg:text-xl"
            >
                <div className="row-start-1 row-end-2 lg:col-start-2 lg:col-end-4">
                    <label className="pr-2 lg:inline-block" htmlFor={"sortValue"}>Loại biểu đồ:</label>
                    <select
                        className="border border-blue-300 rounded-md"
                        id="sortValue"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                    >
                        <option value="MonthRevenue">Doanh thu</option>
                        <option value="ProductSold">Số lượng sản phẩm bán ra</option>
                    </select>
                </div>
                <div
                    className="row-start-2 row-end-3 lg:col-start-4 lg:col-end-6 lg:row-start-1 lg:row-end-2 ">
                    <label className="pr-2 lg:inline-block" htmlFor={"productId"}>Mã sản phẩm:</label>
                    <input
                        className="border border-blue-300 rounded-md"
                        type="text"
                        id="productId"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                    />
                </div>
                <div
                    className={"row-start-3 row-end-4 lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-3"}>
                    <label className="pr-2" htmlFor={"fromDate"}>Từ:</label>
                    <input
                        className="border border-blue-300 rounded-md"
                        type="month"
                        id="fromDate"
                        value={format(new Date(fromDate), 'yyyy-MM', {locale: vi})}
                        onChange={(e) => setFromDate(parseISO(`${e.target.value}-01T00:00:00.000Z`))}
                    />
                </div>
                <div className={"row-start-4 row-end-5 lg:col-start-4 lg:col-end-6 lg:row-start-2 lg:row-end-3"}>
                    <label className="pr-2" htmlFor={"toDate"}>Đến:</label>
                    <input
                        className="border border-blue-300 rounded-md"
                        type="month"
                        id="toDate"
                        value={format(new Date(toDate), 'yyyy-MM', {locale: vi})}
                        onChange={(e) => setToDate(parseISO(`${e.target.value}-01T00:00:00.000Z`))}
                    />
                </div>
                <button
                    className="border border-blue-300 rounded-md bg-blue-400 text-white lg:col-start-6 lg:col-end-7 lg:row-start-2 lg:row-end-3 lg:h-fit"
                    onClick={() => handleAnalyze()}
                >
                    Thống kê
                </button>
            </div>
            <div className="2xl:w-5/6 2xl:m-auto">
                <div className="flex flex-col items-center p-2">
                    <span className="font-semibold text-xl">{chartTitle}</span>
                    {
                        chartData && chartData.labels &&
                        <Line className={"w-screen h-screen"} data={chartData}/>
                    }
                </div>
            </div>
        </div>
    );
}
