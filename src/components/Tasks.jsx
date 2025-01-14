import React from "react";
import { Button, Divider, Tag, Image } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { axiosInstance } from "../api";
import { useDispatch } from "react-redux";
import { setEditTask, setLoading, setOpenModalTask, setOpenPreviewPDF, setRefresh } from "../slices/common";
import { convertDateString } from "../utils";

import Discussion from "./Discussion";
import PreviewPDF from "./PreviewPDF";
import ModalTask from "./ModalTask";
import { useSelector } from "react-redux";

const Tasks = () => {
    const dispatch = useDispatch();
    const isRef = useSelector((state) => state.common.isRefresh);
    const isModalTask = useSelector((state) => state.common.isOpenModalTask);
    const [searchParams, setSearchParams] = useSearchParams();
    const [tasks, setTasks] = React.useState([]);
    const [itemDetail, setItemDetail] = React.useState({});
    const [discussion, setDiscussion] = React.useState([]);
    const [statusId, setStatusId] = React.useState(0);
    const [modalDataDetail, setModalDataDetail] = React.useState({});

    let projectId = Number(searchParams.get("projectId") ?? 0);
    let taskId = Number(searchParams.get("taskId") ?? 0);

    const getListTasks = async () => {
        try {
            dispatch(setLoading(true));
            const resp = await axiosInstance.get("/api/task/list", {
                params: {
                    projectId: projectId,
                },
            });

            const items = [];

            if (resp.data.results && resp.data.results.length > 0) {
                resp.data.results.forEach((item) => {
                    let unit = {
                        id: item.status.id,
                        name: item.status.name,
                    };

                    let elements = [];

                    if (item.listTask && item.listTask.length > 0) {
                        item.listTask.forEach((ele, idx) => {
                            if (idx === 0) {
                                if (taskId === null || taskId === 0) {
                                    getDetailTask(ele.id);
                                    getDiscussion(ele.id);
                                }
                            }

                            elements.push({
                                id: ele.id,
                                name: ele.name,
                                type: ele.category?.name ?? "",
                            });
                        });
                    } else {
                        setItemDetail({});
                    }

                    unit.elements = elements;

                    items.push(unit);
                });
                setTasks(items);
            }
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getDetailTask = async (taskId) => {
        try {
            dispatch(setLoading(true));
            const resp = await axiosInstance.get("/api/task/detail", {
                params: {
                    taskId: taskId,
                },
            });

            let data = resp.data.results;

            if (data) {
                const documents = data.documents.map((document) => {
                    let type = "png";
                    const lastIndex = document.name.lastIndexOf(".");
                    if (
                        !["png", "jpg", "jpeg", "webp"].includes(
                            document.name.slice(lastIndex + 1, document.name.length)
                        )
                    ) {
                        type = "other";
                    }

                    return {
                        ...document,
                        type: type,
                    };
                });
                data.documents = documents;
                const fetchPromises = data.documents.map((document) => getDetailImage(data.id, document.name));
                const files = await Promise.all(fetchPromises);
                data.files = files;
                setItemDetail(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getAvatar = async (userId, avatar) => {
        try {
            const resp = await axiosInstance.get("api/user/get-avatar", {
                params: {
                    userId: userId,
                    avatar: avatar,
                },
            });

            return resp.data.results;
        } catch (error) {
            console.error(error);
        }
    };

    const getDiscussion = async (taskId) => {
        try {
            const resp = await axiosInstance.get("/api/task/discussion/list", {
                params: {
                    taskId: taskId,
                },
            });

            const data = resp.data.results;

            if (data.length > 0) {
                const fetchPromises = data.map(async (item) => {
                    item.avatar = await getAvatar(item.user.id, item.user.avatar);
                });
                await Promise.all(fetchPromises);
            }

            setDiscussion(data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTask = async () => {
        try {
            await axiosInstance.delete("/api/task/delete", {
                params: {
                    taskId: taskId,
                },
            });
            searchParams.delete("taskId");
            setSearchParams(searchParams);
            dispatch(setRefresh());
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = (statusId) => {
        dispatch(setOpenModalTask(true));
        setStatusId(statusId);
        dispatch(setEditTask(false));
    };

    const openModalEdit = () => {
        dispatch(setOpenModalTask(true));
        setModalDataDetail(itemDetail);
        dispatch(setEditTask(true));
    };

    const getDetailImage = async (taskId, document) => {
        try {
            const resp = await axiosInstance.get("/api/task/presign-link/document", {
                params: {
                    taskId: taskId,
                    document: document,
                },
            });

            return resp.data.results.url;
        } catch (error) {
            console.error(error);
        }
    };

    const chooseDetailTask = async (taskId) => {
        searchParams.set("taskId", taskId);
        setSearchParams(searchParams);
        getDetailTask(taskId);
        getDiscussion(taskId);
    };

    const previewFile = () => {
        dispatch(setOpenPreviewPDF(true));
    };

    React.useEffect(() => {
        getListTasks();

        if (taskId !== 0) {
            getDetailTask(taskId);
            getDiscussion(taskId);
        }
    }, [projectId, isRef]);

    React.useEffect(() => {
        if (Object.keys(itemDetail).length > 0) {
            getDiscussion(taskId);
        }
    }, [isRef]);

    return (
        <>
            <div className="task-wrapper">
                <div className="task-wrapper__list">
                    {tasks.map((item) => (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} key={item.id}>
                            <div className="task-wrapper__list-header">
                                <div className="title">{item.name}</div>
                                <Button
                                    type="primary"
                                    shape="round"
                                    style={{ background: "green" }}
                                    icon={<PlusOutlined />}
                                    onClick={() => openModal(item.id)}
                                >
                                    Add Tasks
                                </Button>
                            </div>
                            <div className="task-wrapper__list-items">
                                {item.elements.map((ele) => (
                                    <div
                                        className="task-wrapper__list-item"
                                        key={ele.id}
                                        onClick={() => chooseDetailTask(ele.id)}
                                    >
                                        <div className="description">
                                            <div>{ele.name}</div>
                                            {ele.type && (
                                                <div>
                                                    <Tag color="green">{ele.type}</Tag>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="task-wrapper__detail">
                    <div className="task-wrapper__detail-top">
                        <div className="title">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: 32, fontWeight: "bold" }}>{itemDetail?.name ?? ""}</div>
                                    <div>
                                        Added by {itemDetail?.createdBy?.name ?? ""}.{" "}
                                        {convertDateString(itemDetail.createdAt)}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <Button
                                        style={{ background: "orange" }}
                                        type="primary"
                                        color="yellow"
                                        onClick={() => openModalEdit()}
                                        icon={<EditOutlined />}
                                    >
                                        Cập nhật
                                    </Button>

                                    <Button
                                        type="primary"
                                        danger
                                        onClick={() => deleteTask()}
                                        icon={<DeleteOutlined />}
                                    >
                                        Xóa nhiệm vụ
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="description">
                            <div>
                                <div style={{ fontSize: 16, fontWeight: "bold" }}>Người nhận bàn giao</div>
                                <div style={{ fontSize: 14 }}>{itemDetail?.assignee?.name ?? ""}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: "bold" }}>Ngày kết thúc</div>
                                <div style={{ fontSize: 14 }}>{convertDateString(itemDetail?.dueDate ?? "")}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: "bold" }}>Tag</div>
                                <Tag color="purple">{itemDetail?.status?.name ?? ""}</Tag>
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: "bold" }}>Người đánh giá</div>
                                <div style={{ fontSize: 14 }}>{itemDetail?.reviewer?.name ?? ""}</div>
                            </div>
                        </div>
                        <Divider />
                    </div>
                    <div className="task-wrapper__detail-middle">
                        <div className="title">Tài liệu</div>
                        <div className="content">{itemDetail?.string ?? ""}</div>
                        <div className="file">
                            {Object.keys(itemDetail).length > 0 &&
                                itemDetail.documents.map((item, idx) => (
                                    <div className="file-wrapper" key={idx}>
                                        {item.type !== "png" ? (
                                            <div
                                                className="icon-paper"
                                                style={{ fontSize: 30 }}
                                                onClick={previewFile}
                                            ></div>
                                        ) : (
                                            <Image src={itemDetail.files[idx]} />
                                        )}
                                        <PreviewPDF file={itemDetail.files[idx]} />
                                    </div>
                                ))}
                        </div>
                        <Divider />
                    </div>
                    <Discussion discussion={discussion} taskId={itemDetail.id} />
                </div>
                {/*Modal create or Update*/}
                {isModalTask ? <ModalTask projectId={projectId} statusId={statusId} data={modalDataDetail} /> : null}
            </div>
        </>
    );
};

export default Tasks;
