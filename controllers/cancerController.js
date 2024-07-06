const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.checkCancer = async (req, res) => {
  const imageFilePath = req.file.path;

  const formData = new FormData();
  formData.append("file", fs.createReadStream(imageFilePath));

  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (response) {
      res.status(200).json({ data: response.data.prediction });
    } else {
      res.status(500).json({ error: "Image processing failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Delete uploaded image file
    fs.unlink(imageFilePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
      }
    });
  }
};
