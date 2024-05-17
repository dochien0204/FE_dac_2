import React, { useState } from "react";
import { Upload, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const UploadPreview = ({ getFiles, files }) => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [fileList, setFileList] = useState([]);

    const handleCancel = () => setPreviewVisible(false);

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        if (file.type === "application/pdf") {
            setPreviewImage(file.preview);
        } else {
            setPreviewImage(file.url || file.preview);
        }

        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
    };

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        getFiles(newFileList);
    };

    const handleBeforeUpload = (file, fileList) => {
        return false; // Prevents automatic upload
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const downloadFile = async (file) => {
        try {
            const response = await axios.get(file, {
                responseType: "blob",
            });
            const fileData = new Blob([response.data]);

            console.log(fileData)
            const fileURL = URL.createObjectURL(fileData);

            return {
                name: `image-${Math.random()}`,
                url: fileURL,
            };
        } catch (error) {
            console.error("Failed to download file:", error);
        }
    };

    const getFileExist = async () => {
        const fetchPromises = files.map((file) => downloadFile(file));
        const data = await Promise.all(fetchPromises);
        setFileList(data);
    };

    React.useEffect(() => {
        if (files.length > 0) getFileExist();
    }, []);

    return (
        <div>
            <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={handleBeforeUpload}
            >
                {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            <Modal open={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default UploadPreview;
