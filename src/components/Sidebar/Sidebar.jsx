import React, {useState, useEffect, useRef} from "react";
import {
    BiSolidHome,
    BiSolidTruck,
    BiSolidUser,
    BiSolidDiscount,
    BiLogOutCircle,
} from "react-icons/bi";
import {BsFillBoxSeamFill, BsFillCalendar2RangeFill} from "react-icons/bs";
import {FaUsers} from "react-icons/fa";
import {SiGoogleanalytics} from "react-icons/si";
import techShopLogo from "../../assets/images/logo/techShopLogo.svg";
import {useNavigate} from "react-router-dom";
import {getLastId} from "../../services/Order/Order";
import {toast} from "react-toastify";

function Sidebar() {
    const [dateTime, setDateTime] = useState("");
    const [menu, setMenu] = useState(
        sessionStorage.getItem("menu") ? sessionStorage.getItem("menu") : "home"
    );
    const currentLastOrderId = useRef(0);
    const [role, setRole] = useState(sessionStorage.getItem("role"));
    const navigate = useNavigate();

    const buttonClass = "flex flex-col items-center justify-center rounded-md mb-2 p-2 hover:bg-green-300 w-full";

    const normalLink = `${buttonClass}`;
    const activeLink = `${buttonClass} bg-green-300`;

    useEffect(() => {
        const updateDateTime = () => {
            const date = new Date();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            setDateTime(
                `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute
                }:${second < 10 ? `0${second}` : second} - ${day < 10 ? `0${day}` : day
                }/${month < 10 ? `0${month}` : month}/${year}`
            );
        };

        // Update the date and time every 500 milliseconds
        const interval = setInterval(updateDateTime, 500);

        // Clean up the interval when the component unmounts
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const setLastOrderId = async () => {
            try {
                const lastOrderId = await getLastId();
                currentLastOrderId.current = lastOrderId;
            } catch (err) {
                console.log(err);
            }
        }

        setLastOrderId();
    }, []);

    useEffect(() => {
        const interval = setInterval(checkNewOrder, 5000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    const checkNewOrder = async () => {
        try {
            const lastOrderId = await getLastId();
            if (lastOrderId !== currentLastOrderId.current) {
                currentLastOrderId.current = lastOrderId;
                toast('Có đơn hàng mới!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        } catch (err) {
            console.log(err);
        }
    }


    const handleMenuClick = (e) => {
        const value = e.currentTarget.value;

        switch (value) {
            case "logo":
                setMenu("home");
                navigate("/home");
                break;
            case "home":
                setMenu("home");
                navigate("/home");
                break;
            case "orders":
                setMenu("orders");
                navigate("/orders");
                break;
            case "products":
                setMenu("products");
                navigate("/products");
                break;
            case "customers":
                setMenu("customers");
                navigate("/customers");
                break;
            case "discounts":
                setMenu("discounts");
                navigate("/discounts");
                break;
            case "staffs":
                setMenu("staffs");
                navigate("/staffs");
                break;
            case "review":
                setMenu("review");
                navigate("/review");
                break;
            case "statistics":
                setMenu("statistics");
                navigate("/statistics");
                break;

            case "logout":
                setMenu("home");
                sessionStorage.removeItem("token");
                window.location.href = "/login";
                break;

            default:
                break;
        }
    };
    return (
        <div className="text-xs md:text-base grid grid-rows-7 h-full">
            <div className="row-start-1 row-end-2 pt-3">
                <button value={"logo"} onClick={(e) => handleMenuClick(e)}
                        className="">
                    <img className="" src={techShopLogo} alt="logo"/>
                </button>
            </div>

            <div className="row-start-2">
                <button
                    onClick={(e) => handleMenuClick(e)}
                    value={"home"}
                    className={(menu === "home") ? activeLink : normalLink}
                >
                    <BiSolidHome className=""/>
                    <span className="pl-1">Trang chính</span>
                </button>
                <button
                    onClick={(e) => handleMenuClick(e)}
                    value={"orders"}
                    className={(menu === "orders") ? activeLink : normalLink}
                >
                    <BiSolidTruck className=""/>
                    <span className="pl-1">Đơn hàng</span>
                </button>
                <button
                    onClick={(e) => handleMenuClick(e)}
                    value={"products"}
                    className={(menu === "products") ? activeLink : normalLink}
                >
                    <BsFillBoxSeamFill className=""/>
                    <span className="pl-1">Sản phẩm</span>
                </button>
                <button
                    onClick={(e) => handleMenuClick(e)}
                    value={"customers"}
                    className={(menu === "customers") ? activeLink : normalLink}
                >
                    <BiSolidUser className=""/>
                    <span className="pl-1">Khách hàng</span>
                </button>
                <button
                    onClick={(e) => handleMenuClick(e)}
                    value={"discounts"}
                    className={(menu === "discounts") ? activeLink : normalLink}
                >
                    <BiSolidDiscount className=""/>
                    <span className="pl-1">Mã giảm giá</span>
                </button>
                {
                    role === "admin" &&
                    <button
                        onClick={(e) => handleMenuClick(e)}
                        value={"staffs"}
                        className={(menu === "staffs") ? activeLink : normalLink}
                    >
                        <FaUsers className=""/>
                        <span className="pl-1">Nhân viên</span>
                    </button>
                }
                <button
                    onClick={(e) => handleMenuClick(e)}
                    value={"review"}
                    className={(menu === "review") ? activeLink : normalLink}
                >
                    <BsFillCalendar2RangeFill className=""/>
                    <span href="" className="pl-1">
                        Đánh giá
                    </span>
                </button>
                {
                    role === "admin" &&
                    <button
                        onClick={(e) => handleMenuClick(e)}
                        value={"statistics"}
                        className={(menu === "statistics") ? activeLink : normalLink}
                    >
                        <SiGoogleanalytics className=""/>
                        <span className="pl-1">Thống kê</span>
                    </button>
                }
                <button
                    value={"logout"}
                    onClick={(e) => handleMenuClick(e)}
                    className={`${buttonClass}`}
                >
                    <BiLogOutCircle className=""/>
                    <span className="">Đăng xuất</span>
                </button>

                <div className="hidden md:flex md:text-center md:justify-center">
                    {dateTime}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
