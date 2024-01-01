import React, {useEffect, useState, useRef} from "react";
import CustomerDetail from "../Customers/CustomerDetail";
import CustomerStatus from "../Customers/CustomerStatus";
import ReviewDetail from "./ReviewDetail";
import {fetchReviews, UpdateReview} from "../../services/Review/Review";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [review, setReview] = useState({
        id: "",
        productId: "",
        customerEmail: "",
        rating: "",
        content: "",
        adminReply: "",
    });
    const [visibleReviewDetail, setVisibleReviewDetail] = useState(false);
    const [originalReviews, setOriginalReviews] = useState({});

    useEffect(() => {
        sessionStorage.setItem("menu", "review");
    }, []);

    useEffect(() => {
        fetchReviews().then((data) => {
            setReviews(data);
            setOriginalReviews(data);
        });
    }, []);

    const search = useRef({
        searchValue: "",
        sortValue: "productId",
        statusValue: "all",
    });

    const handleOpenReviewDetail = (review) => {
        setReview(review);
        setVisibleReviewDetail(true);
    }

    const handleOnCloseReviewDetail = () => {
        setVisibleReviewDetail(false);
    }

    const handleOnSaveReviewDetail = async (review) => {
        try {
            const response = await UpdateReview(review);
            if (response.status === 200) {
                setVisibleReviewDetail(false);
                fetchReviews().then((data) => {
                    setReviews(data);
                    setOriginalReviews(data);
                });
                alert("Cập nhật thành công");
            } else {
                alert("Cập nhật thất bại");
                console.log(response);
            }
        } catch (e) {
            alert("Cập nhật thất bại");
            console.log(e);
        }
    }

    const handleOnChangeSearchType = (e) => {
        const {id, value} = e.target;
        search.current = {
            ...search.current,
            [id]: value
        };
    }

    const handleOnSearch = () => {
        const searchValue = search.current.searchValue;
        const sortValue = search.current.sortValue;
        const statusValue = search.current.statusValue;

        console.log(sortValue);
        const searchResult = originalReviews.filter((review) => {
                if (statusValue === "all") {
                    if (sortValue === "productId") {
                        return review[sortValue].toString().includes(searchValue);
                    }
                    return review[sortValue].toLowerCase().includes(searchValue.toLowerCase());
                } else {
                    if (sortValue === "productId") {
                        return review[sortValue].toString().includes(searchValue)
                            && (review.adminReply == null ? "noReplied" : "replied") === statusValue;
                    }
                    return review[sortValue].toLowerCase().includes(searchValue.toLowerCase())
                        && (review.adminReply === null ? "noReplied" : "replied") === statusValue;
                }
            }
        );

        setReviews(searchResult);
    }

    return (
        <div className="">
            <div className="top-0 right-0 backdrop-blur-sm grid grid-cols-6 grid-rows-2 lg:grid-rows-1 lg:text-xl">
                <input
                    type="text"
                    id="searchValue"
                    className="col-start-1 col-end-7 lg:col-end-4 row-start-1 row-end-2 border border-blue-300 rounded-md"
                    placeholder="Tìm kiếm đánh giá"
                    value={search.searchValue}
                    onChange={(e) => handleOnChangeSearchType(e)}
                />
                <select
                    className="col-start-1 col-end-3 lg:col-start-4 lg:col-end-5 row-start-2 lg:row-start-1 row-end-3 lg:row-end-2 border border-blue-300 rounded-md"
                    id="sortValue"
                    onChange={(e) => handleOnChangeSearchType(e)}
                >
                    <option value="id">ID sản phẩm</option>
                    <option value="CustomerEmail">Email khách hàng</option>
                </select>
                <select
                    className="col-start-3 col-end-5 lg:col-start-5 lg:col-end-6 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 border border-blue-300 rounded-md"
                    id="statusValue"
                    onChange={(e) => handleOnChangeSearchType(e)}
                >
                    <option value="all">Tất cả</option>
                    <option value="replied">Đã phản hồi</option>
                    <option value="noReplied">Chưa phản hồi</option>
                </select>

                <button
                    className="col-start-5 col-end-7 lg:col-start-6 lg:col-end-7 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 border border-blue-300 rounded-md bg-blue-400 text-white"
                    onClick={handleOnSearch}
                >
                    Tìm kiếm
                </button>
            </div>
            <div className="overflow-x-auto overflow-y-auto h-[85vh] lg:h-[87vh]">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="text-center py-3">
                            ID
                        </th>
                        <th scope="col" className="text-center">
                            ID Sản phẩm
                        </th>
                        <th scope="col" className="text-center">
                            Email khách hàng
                        </th>
                        <th scope="col" className="text-center">
                            Đánh giá
                        </th>
                        <th scope="col" className="text-center">
                            Trạng thái
                        </th>
                        <th scope={"col"} className="text-center">
                            Hành động
                        </th>
                    </tr>
                    </thead>
                    <tbody className={"text-xs md:text-base text-center"}>
                    {
                        reviews.map((review) => (
                                <tr key={review.id}
                                    className="odd:bg-white even:bg-gray-50 border-b dark:border-gray-700">
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {review.id}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {review.productId}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {review.customerEmail}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {review.rating}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        {review.adminReply ? "Đã trả lời" : "Chưa trả lời"}
                                    </td>
                                    <td scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap">
                                        <button className="px-2 py-1 text-white bg-blue-500 rounded-md"
                                                onClick={() => handleOpenReviewDetail(review)}
                                        >
                                            Chi tiết
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
                visibleReviewDetail &&
                <ReviewDetail visible={visibleReviewDetail} onClose={handleOnCloseReviewDetail}
                              onSave={handleOnSaveReviewDetail} data={review}/>
            }
        </div>

    );
}
