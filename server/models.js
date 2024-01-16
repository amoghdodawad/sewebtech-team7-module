const { Schema, model, connect } = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

const mongoose = require('mongoose');
const ConferenceSchema = new Schema({
    emailId: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    details_of_conferences: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    Awards: {
        type: String,
    },
});

const Conference = mongoose.model('Conference', ConferenceSchema);

async function connectToDB(databaseURL) {
    try {
        await connect(databaseURL);
        console.log('Connected to DB');
    } catch (err) {
        console.log(err);
    }
}

async function updateConferenceById(id, updatedData) {
    try {
        const updatedConference = await Conference.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        );

        return updatedConference;
    } catch (error) {
        throw error;
    }
}

async function deleteConferenceById(id) {
    try {
        console.log('Deleting conference with ID:', id);

        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     console.log('Invalid ID:', id);
        //     return null;
        // }

        const deletedConference = await Conference.findOneAndDelete({id:id});
        console.log('Deleted conference:', deletedConference);

        return deletedConference;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}
app.post('/test', async function (req, res) {
    const { id, title, details_of_conferences, year, Awards } = req.body;
    const emailId = 'user_email@example.com';

    const newConference = new Conference({
        emailId,
        id,
        title,
        details_of_conferences,
        year,
        Awards,
    });

    try {
        await newConference.save();
        console.log('Conference saved successfully');
        res.status(201).json({
            message: 'Conference created successfully',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
});

app.get('/test2', async function (req, res) {
    const emailId = 'user_email@example.com';

    try {
        const response = await Conference.find({ emailId });
        console.log(response);
        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/search', async function (req, res) {
    const { query } = req.query;

    try {
        const response = await Conference.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { details_of_conferences: { $regex: query, $options: 'i' } },
                { year: { $regex: query, $options: 'i' } },
                { Awards: { $regex: query, $options: 'i' } },
            ],
        });
        res.json(response);
    } catch (error) {
        console.error('Error searching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/delete/:id', async function (req, res) {
    const id = req.params.id;
    console.log(id);
    try {
        const deletedConference = await deleteConferenceById(id);
        if (!deletedConference) {
            return res.status(404).json({ message: 'Conference not found' });
        }
        console.log('Conference deleted successfully');
        res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/update/:id', async function (req, res) {
    const id = req.params.id;
    const updatedData = req.body; // Assuming the updated data is sent in the request body

    try {
        const updatedConference = await updateConferenceById(id, updatedData);
        if (!updatedConference) {
            return res.status(404).json({ message: 'Conference not found' });
        }
        console.log('Conference updated successfully');
        res.status(200).json({
            message: 'Conference updated successfully',
            updatedConference,
        });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Connect to the database
connectToDB('mongodb+srv://kletech:kletech1234@kledatabase.t7xh5su.mongodb.net/?retryWrites=true&w=majority');

module.exports = {
    Conference,
    connectToDB,
    updateConferenceById,
    deleteConferenceById,
};
