const vehicleDocumentModel = require('../models/vehicleDocument.model');

const DOCUMENT_TYPES = ['RC', 'Insurance', 'PUC', 'Permit', 'Other'];
const MAX_FILE_DATA_LENGTH = 2000000; // ~1.5MB raw file, base64-encoded

async function list(req, res) {
    const { vehicleId } = req.query;
    if (!vehicleId) {
        return res.status(422).json({ message: 'vehicleId is required' });
    }
    const documents = await vehicleDocumentModel.listByVehicle(vehicleId);
    return res.status(200).json({ documents });
}

async function create(req, res) {
    const { vehicleId, docType, fileName, mimeType, fileData } = req.body;

    if (!vehicleId || !docType || !fileName || !mimeType || !fileData) {
        return res.status(422).json({ message: 'vehicleId, docType, fileName, mimeType and fileData are required' });
    }
    if (!DOCUMENT_TYPES.includes(docType)) {
        return res.status(422).json({ message: `docType must be one of: ${DOCUMENT_TYPES.join(', ')}` });
    }
    if (fileData.length > MAX_FILE_DATA_LENGTH) {
        return res.status(422).json({ message: 'File is too large (max ~1.5MB)' });
    }

    const fileSize = Math.round((fileData.length * 3) / 4);
    const document = await vehicleDocumentModel.createDocument({
        vehicleId,
        docType,
        fileName,
        mimeType,
        fileSize,
        fileData,
    });
    return res.status(201).json({ document });
}

async function getFile(req, res) {
    const document = await vehicleDocumentModel.findById(req.params.id);
    if (!document) {
        return res.status(404).json({ message: 'Document not found' });
    }
    return res.status(200).json({
        fileName: document.file_name,
        mimeType: document.mime_type,
        fileData: document.file_data,
    });
}

async function remove(req, res) {
    const deleted = await vehicleDocumentModel.deleteDocument(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Document not found' });
    }
    return res.status(200).json({ message: 'Document deleted' });
}

module.exports = { list, create, getFile, remove, DOCUMENT_TYPES };
