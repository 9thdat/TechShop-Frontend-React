import React, {useState, useEffect, useRef} from "react";
import CustomerDetail from "./CustomerDetail";
import CustomerStatus from "./CustomerStatus";
import {changeCustomerStatus, fetchCustomers, AddCustomer} from "../../services/Customer/Customer";

export default function Customers() {
    const [customers, setCustomers] = useState([]); // List of customers
    const [customer, setCustomer] = useState({}); // Data of customer
    const [visibleCustomerDetail, setVisibleCustomerDetail] = useState(false); // Visible of CustomerDetail
    const [visibleCustomerStatus, setVisibleCustomerStatus] = useState(false); // Visible of CustomerStatus
    const [action, setAction] = useState(""); // Action of CustomerDetail
    const [originCustomers, setOriginCustomers] = useState([]); // List of customers before search

    const search = useRef({
        searchValue: "",
        sortValue: "name",
        statusValue: "all"
    });

    useEffect(() => {
        sessionStorage.setItem("menu", "customers");
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchCustomers();
                setCustomers(data);
                setOriginCustomers(data);
            } catch (error) {
                console.log("Failed to fetch customer list: ", error.message);
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            // Perform any cleanup if needed
        };
    }, []);  // Empty dependency array means this effect runs once after the initial render

    const handleOpenAddCustomer = () => {
        setAction("add");
        // Sử dụng hàm callback để đảm bảo cập nhật đồng bộ
        setCustomer(() => {
            // Reset trạng thái customer thành đối tượng rỗng
            return {};
        });
        setVisibleCustomerDetail(true);
    }


    const handleDetailCustomer = (customerData) => {
        setCustomer(customerData);
        setAction("detail");
        setVisibleCustomerDetail(true);
    }

    const handleCloseCustomerDetail = (a) => {
        setVisibleCustomerDetail(false);
        if (a === "add") {
            fetchCustomers().then(r => setCustomers(r));
        }
    }

    const handleChangeStatusCustomer = (e) => {
        const customer = customers.find((c) => c.email === e.target.value);
        setCustomer(customer);
        setVisibleCustomerStatus(true);
    }

    const handleCloseCustomerStatus = () => {
        setVisibleCustomerStatus(false);
    }

    const handleOnSearch = () => {
        const searchValue = search.current.searchValue;
        const sortValue = search.current.sortValue;
        const statusValue = search.current.statusValue;

        const searchResult = originCustomers.filter((customer) => {
                if (statusValue === "all") {
                    return customer[sortValue].toLowerCase().includes(searchValue.toLowerCase());
                } else {
                    return customer[sortValue].toLowerCase().includes(searchValue.toLowerCase()) && customer.status === statusValue;
                }
            }
        );

        setCustomers(searchResult);
    }

    const handleOnChangeSearchType = (e) => {
        const {id, value} = e.target;
        search.current = {
            ...search.current,
            [id]: value
        };
    }


    const handleOnChangeStatus = async () => {
        const response = await changeCustomerStatus(customer.email);
        if (response.status === 204) {
            alert("Đổi tình trạng thành công!");
            const data = await fetchCustomers();
            setCustomers(data);
        } else {
            alert("Đổi tình trạng thất bại!");
        }
        setVisibleCustomerStatus(false);

    }

    const handleAddCustomer = async (customerData) => {
        const response = await AddCustomer(customerData);
        if (response.status === 201) {
            alert("Thêm khách hàng thành công!");
            handleCloseCustomerDetail("add");

            const data = await fetchCustomers();
            setCustomers(data);
        } else {
            alert("Thêm khách hàng thất bại!");
        }
    }

    return (
        <div className="">
            <div className="top-0 right-0 backdrop-blur-sm grid grid-cols-6 grid-rows-2 lg:grid-rows-1 lg:text-xl">
                <button
                    className="col-start-1 col-end-3 lg:col-end-2 row-start-1 row-end-2 border border-green-500 rounded-md bg-green-500 text-white"
                    onClick={handleOpenAddCustomer}>Thêm mới
                </button>

                <input
                    type="text"
                    id="searchValue"
                    className="col-start-3 lg:col-start-2 col-end-7 lg:col-end-4 row-start-1 row-end-2 border border-blue-300 rounded-md"
                    placeholder="Tìm kiếm khách hàng"
                    value={search.searchValue}
                    onChange={(e) => handleOnChangeSearchType(e)}
                />
                <select
                    className="col-start-1 col-end-3 lg:col-start-4 lg:col-end-5 row-start-2 lg:row-start-1 row-end-3 lg:row-end-2 border border-blue-300 rounded-md"
                    id="sortValue"
                    onChange={(e) => handleOnChangeSearchType(e)}
                >
                    <option value="name">Tên</option>
                    <option value="email">Email</option>
                    <option value="phone">Số điện thoại</option>
                </select>
                <select
                    className="col-start-3 col-end-5 lg:col-start-5 lg:col-end-6 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 border border-blue-300 rounded-md"
                    id="statusValue"
                    onChange={(e) => handleOnChangeSearchType(e)}
                >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                </select>

                <button
                    className="col-start-5 col-end-7 lg:col-start-6 lg:col-end-7 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 border border-blue-300 rounded-md bg-blue-400 text-white"
                    onClick={handleOnSearch}>Tìm kiếm
                </button>
            </div>
            <div className="overflow-x-auto overflow-y-auto h-[85vh] lg:h-[87vh]">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <tbody className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="text-center py-3">
                            Email
                        </th>
                        <th scope="col" className="text-center">
                            Tên
                        </th>
                        <th scope="col" className="text-center">
                            Số điện thoại
                        </th>
                        <th scope="col" className="text-center">
                            Giới tính
                        </th>
                        <th scope="col" className="text-center">
                            Ngày sinh
                        </th>
                        <th scope="col" className="text-center">
                            Địa chỉ
                        </th>
                        <th scope="col" className="text-center">
                            Tình trạng
                        </th>
                        <th scope="col" className="text-center">
                            Hành động
                        </th>
                    </tr>
                    </tbody>
                    <tbody className={"text-xs md:text-base"}>
                    {
                        customers.map((customer) => (
                                <tr key={customer.email}
                                    className="odd:bg-white even:bg-gray-50 border-b dark:border-gray-700">
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {customer.email}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {customer.name}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {customer.phone}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {customer.gender}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {customer.birthday}
                                    </td>
                                    <td scope="row"
                                        className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-xs"
                                    >
                                        {customer.address + ', ' + customer.ward + ', ' + customer.district + ', ' + customer.city}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {customer.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap">
                                        <button
                                            className="px-2 py-1 text-white bg-blue-400 rounded-md"
                                            value={customer.email}
                                            onClick={(e) => handleDetailCustomer(customer)}>Chi tiết
                                        </button>
                                        <button className="px-2 py-1 ml-2 text-white bg-red-500 rounded-md"
                                                value={customer.email}
                                                onClick={(e) => handleChangeStatusCustomer(e)}>Đổi tình trạng
                                        </button>
                                    </td>
                                </tr>
                            )
                        )
                    }
                    </tbody>
                </table>
            </div>

            {
                visibleCustomerDetail &&
                <CustomerDetail visible={visibleCustomerDetail} onClose={handleCloseCustomerDetail}
                                customerData={customer} action={action} addCustomer={handleAddCustomer}/>
            }

            {
                visibleCustomerStatus &&
                <CustomerStatus visible={visibleCustomerStatus} onClose={handleCloseCustomerStatus}
                                customerData={customer} onChangeStatus={handleOnChangeStatus}/>
            }

        </div>
    );
}
