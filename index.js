const express = require("express");
const fs = require("fs"); // To write the file on body.
const users = require("./User_Info.json");

const app = express();
const PORT = 8000;

// Middleware to parse URL-encoded data and JSON bodies.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ROUTES

app.get("/users", (req, res) => {
    const html = `
    <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
    res.send(html);
});

// REST API

app.get("/api/users", (req, res) => { 
    return res.json(users);
});

app
    .route("/api/users/:id")
    .get((req, res) => { 
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        return res.json(user);
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        const updatedUser = { ...users[userIndex], ...req.body };
        users[userIndex] = updatedUser;
        fs.writeFile('./User_Info.json', JSON.stringify(users), (err) => {
            if (err) {
                return res.status(500).json({ status: "error", message: "Failed to update user data" });
            }
            return res.json({ status: "success", user: updatedUser });
        });
    })
    .delete((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex((user) => user.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        users.splice(userIndex, 1);
        fs.writeFile('./User_Info.json', JSON.stringify(users), (err) => {
            if (err) {
                return res.status(500).json({ status: "error", message: "Failed to delete user data" });
            }
            return res.json({ status: "success", message: "User deleted" });
        });
    });

app.post("/api/users", (req, res) => {
    const body = req.body;
    const newUser = { ...body, id: users.length + 1 };
    users.push(newUser);
    fs.writeFile('./User_Info.json', JSON.stringify(users), (err) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Failed to save user data" });
        }
        return res.json({ status: "success", user: newUser });
    });
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
