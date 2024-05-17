import { Button, Input, Form } from "antd";
import { axiosInstance } from "../api";
import { useDispatch } from "react-redux";
import { setRefresh } from "../slices/common";
import React from "react";
import { convertDateString } from "../utils";

const Discussion = ({ discussion, taskId }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const handleCreateDiscussion = async (values) => {
        try {
            const payload = {
                taskId: taskId,
                comment: values.comment,
            };

            await axiosInstance.post("/api/task/discussion", payload);
            form.resetFields();
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setRefresh());
        }
    };

    return (
        <Form form={form} onFinish={handleCreateDiscussion}>
            <div className="task-wrapper__detail-bottom">
                <div className="title">Thảo luận</div>
                <div className="comment">
                    <div className="comment__input">
                        <Form.Item
                            name="comment"
                            rules={[
                                {
                                    required: true,
                                    message: "Hãy nhập bình luận của bạn",
                                },
                            ]}
                        >
                            <Input size="large" style={{ width: 350 }} placeholder="Thêm bình luận ..." />
                        </Form.Item>

                        <Button type="primary" size="large" onClick={() => form.submit()}>
                            Thêm bình luận
                        </Button>
                    </div>
                    <div className="comment__list">
                        {discussion.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <div style={{ width: 50, height: 50 }}>
                                    <img style={{ width: "100%", height: "100%", borderRadius: "50%" }} src={item.avatar.url} alt="" />
                                </div>
                                <div className="comment__item">
                                    <div style={{ fontWeight: "bold" }}>{item.user.name} <span> &nbsp; &nbsp; &nbsp; &nbsp;{convertDateString(item.createdAt)}</span></div>
                                    <div style={{ fontSize: 12 }}>
                                        <i>{item.comment}</i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Form>
    );
};

export default Discussion;
