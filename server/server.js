require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= REGISTER =================
// app.post("/register", async (req, res) => {
//   try {
//     const { nama_lengkap, email, username, password } = req.body;

//     // hash password
//     const password_hash = await bcrypt.hash(password, 10);

//     const result = await pool.query(
//       `INSERT INTO users (nama_lengkap, email, username, password_hash)
//        VALUES ($1, $2, $3, $4)
//        RETURNING id, username, email`,
//       [nama_lengkap, email, username, password_hash]
//     );

//     res.json({
//       message: "Register berhasil",
//       user: result.rows[0],
//     });
//   } catch (err) {
//     console.error(err);

//     if (err.code === "23505") {
//       return res.status(400).json({
//         message: "Email atau username sudah digunakan",
//       });
//     }

//     res.status(500).json({ message: "Server error" });
//   }
// });

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { kanwil_id, password } = req.body;

    // validasi input
    if (!kanwil_id || !password) {
      return res.status(400).json({
        message: "Kanwil dan password wajib diisi",
      });
    }

    // ambil user + nama kanwil
    const result = await pool.query(
      `SELECT u.id, u.password_hash, u.role, k.nama AS kanwil_nama
       FROM users u
       JOIN kanwil k ON u.kanwil_id = k.id
       WHERE u.kanwil_id = $1`,
      [kanwil_id]
    );

    const user = result.rows[0];

    // cek user
    if (!user) {
      return res.status(401).json({
        message: "User tidak ditemukan",
      });
    }

    // compare password (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    // generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        kanwil: user.kanwil_nama,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // update last login
    await pool.query(
      `UPDATE users SET last_login = NOW() WHERE id = $1`,
      [user.id]
    );

    // response
    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        kanwil: user.kanwil_nama,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

app.get("/kanwil", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nama FROM kanwil ORDER BY nama`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});