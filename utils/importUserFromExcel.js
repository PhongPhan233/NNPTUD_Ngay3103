const xlsx = require('xlsx');
const userController = require('../controllers/users');
const roleModel = require('../schemas/roles');
const { sendMail } = require('./mailHandler');

// random password
function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function importUsersFromExcel(filePath) {
    // đọc file
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const users = xlsx.utils.sheet_to_json(sheet);

    // lấy role USER
    const roleUser = await roleModel.findOne({ name: "USER", isDeleted: false });

    if (!roleUser) {
        throw new Error("Chưa có role USER");
    }

    let results = [];

    for (const u of users) {
        try {
            const password = generatePassword();

            // check trùng
            let existUser = await userController.FindUserByUsername(u.username);
            if (existUser) {
                results.push({ username: u.username, status: "Đã tồn tại" });
                continue;
            }

            // tạo user
            let newUser = await userController.CreateAnUser(
                u.username,
                password,
                u.email,
                roleUser._id
            );

            // gửi mail
            await sendMail(u.email, `
                <h3>Tài khoản của bạn</h3>
                <p>Username: ${u.username}</p>
                <p>Password: ${password}</p>
            `);

            results.push({ username: u.username, status: "OK" });

        } catch (err) {
            results.push({ username: u.username, status: err.message });
        }
    }

    return results;
}

module.exports = { importUsersFromExcel };