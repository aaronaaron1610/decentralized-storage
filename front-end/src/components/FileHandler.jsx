import React, { useEffect, useState } from 'react';
import {ethers} from 'ethers';
import { uploadFile, downloadFile, shareFile } from '../services/ApiServices';
import SecureFileStorageABI from '../ABI/SecureFileStorage.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const SECURE_FILE_STORAGE_ADDRESS = "0xF63C6C62e68d357A37f7da24f7a4A837D712eF9C";

function FileHandler({ walletAddress }) {
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState('');
    const [sharedWith, setSharedWith] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [userFiles, setUserFiles] = useState([]);
    const [shareAddress, setShareAddress] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileAccessList, setFileAccessList] = useState([]);
    

    useEffect(() => {
        if (walletAddress) {
            fetchUserFiles();
        }
    }, [walletAddress]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        try {
            const response = await uploadFile(file);
            console.log('File uploaded:', response);

            const ipfsHash = response.ipfsHash;

            // Get the file name
            const fileName = file.name;

            // Interact with the smart contract to upload the file details
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner();
            console.log("signer ", signer)
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);

            const data = contract.interface.encodeFunctionData("uploadFile", [ipfsHash, fileName]);

            const tx = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        to: SECURE_FILE_STORAGE_ADDRESS,
                        from: await signer.getAddress(),
                        data: data,
                    },
                ],
            });
            // await tx.wait()
            console.log("tx ", tx)
            fetchUserFiles();
        } catch (error) {
            console.error('File upload failed:', error);
        }
    };

    const fetchUserFiles = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);
            const userAddress = await signer.getAddress();
    
            const fileIds = await contract.getUserFiles(userAddress);
            const userFilesWithDetails = [];
    
            for (const fileId of fileIds) {
                const file = await contract.files(fileId);
                const owner = file.owner;
                const permissions = await fetchPermittedUsers(fileId);
    
                userFilesWithDetails.push({
                    fileId,
                    fileName: file.fileName,
                    owner,
                    hasPermission: permissions.includes(userAddress),
                });
            }
    
            setUserFiles(userFilesWithDetails);
        } catch (error) {
            console.error('Failed to fetch user files:', error);
        }
    };
    

    const handleShareFile = async (fileId) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);
    
            const data = contract.interface.encodeFunctionData("updatePermission", [fileId, shareAddress, true]);
    
            // Send the transaction to update the permission
            const tx = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        to: SECURE_FILE_STORAGE_ADDRESS,
                        from: await signer.getAddress(),
                        data: data,
                    },
                ],
            });
            await tx.wait()
            console.log("tx ", tx);
            alert(`File ${fileId} shared with ${shareAddress}`);
        } catch (error) {
            console.error('Failed to share file:', error);
            alert(`Failed to share file: ${error.message}`);
        }
    };
    

    const handleDownload = async (fileId) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);

            // Get IPFS hash from the contract
            const result = await contract.files(fileId);
            const ipfsHash = result[0]

            console.log("ipfsHash ", ipfsHash)

            // Download the file from IPFS
            const response = await downloadFile(ipfsHash);
            console.log("response ", response)
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = fileId;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('File download failed:', error);
        }
    };

    const fetchPermittedUsers = async (fileId) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);
    
            const permittedUsers = await contract.getPermittedUsers(fileId);
            setFileAccessList(permittedUsers);
            return permittedUsers;
        } catch (error) {
            console.error('Failed to fetch permitted users:', error);
        }
    };

    const removePermission = async (fileId, address) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);
    
            const data = contract.interface.encodeFunctionData("updatePermission", [fileId, address, false]);
    
            // Send the transaction to remove the permission
            const tx = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        to: SECURE_FILE_STORAGE_ADDRESS,
                        from: await signer.getAddress(),
                        data: data,
                    },
                ],
            });
            await tx.wait()
            console.log("tx ", tx);
            alert(`Permission for ${address} removed from file ${fileId}`);
            await fetchPermittedUsers(fileId); 
        } catch (error) {
            console.error('Failed to remove permission:', error);
            alert(`Failed to remove permission: ${error.message}`);
        }
    };
    
    
    const handleViewDetails = async (fileId) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(SECURE_FILE_STORAGE_ADDRESS, SecureFileStorageABI, signer);
    
            const result = await contract.files(fileId);
            const ipfsHash = result[0];
            const fileName = result[1];
            const owner = result[2];
    
            console.log("ipfsHash ", ipfsHash);
    
            setSelectedFile({ fileId, fileName, ipfsHash, owner  });
            await fetchPermittedUsers(fileId); 
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch file details:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFile(null);
        setFileAccessList([]);
    };

    return (
        <div className="container mt-5">
        <div className="mb-3">
            <input type="file" className="form-control" onChange={handleFileChange} />
            <button className="btn btn-primary mt-2" onClick={handleUpload}>Upload File</button>
        </div>
        <div className="mb-3">
            <h3>User Files</h3>
            {userFiles.length === 0 ? (
    <p>No files found</p>
) : (
    <ul className="list-group">
        {userFiles.map((file, index) => (
            <li key={index} className="list-group-item">
                File ID: {parseInt(file.fileId)} - {file.fileName}
                <button
                    className="btn btn-info btn-sm float-end mx-1"
                    onClick={() => handleViewDetails(file.fileId)}
                >
                    View Details
                </button>
                <button
                    className="btn btn-success btn-sm float-end mx-1"
                    onClick={() => handleDownload(file.fileId)}
                >
                    Download
                </button>
                {console.log(file.owner.toLowerCase() == walletAddress.toLowerCase())}
                {file.owner.toLowerCase() === walletAddress.toLowerCase() && (
                    <div className="d-flex align-items-center mt-2">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Share With (address)"
                            value={shareAddress}
                            onChange={(e) => setShareAddress(e.target.value)}
                        />
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleShareFile(file.fileId)}
                        >
                            Share File
                        </button>
                    </div>
                )}
            </li>
        ))}
    </ul>
)}

        </div>
        {fileName && (
            <div className="card mt-3">
                <div className="card-header">
                    {fileName}
                </div>
                <div className="card-body">
                    <pre>{fileContent}</pre>
                </div>
            </div>
        )}
     {selectedFile && (
    <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
            <Modal.Title>File Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {console.log("selectedFile ", selectedFile)}
            <p><strong>File ID:</strong> {parseInt(selectedFile.fileId)}</p>
            <p><strong>File Name:</strong> {selectedFile.fileName}</p>
            <p><strong>IPFS Hash:</strong> {selectedFile.ipfsHash}</p>
            <p><strong>Access List:</strong></p>
            <ul>
                {console.log("fileAccessList ", fileAccessList)}
                {fileAccessList.map((address, index) => (
                    <li key={index}>
                        {address} {address === selectedFile.owner ? "(Owner)" : (
                            <button
                                className="btn btn-danger btn-sm float-end"
                                onClick={() => removePermission(selectedFile.fileId, address)}
                            >
                                Remove Permission
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
)}

    </div>
    );
}

export default FileHandler;
