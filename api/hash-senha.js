const bcrypt = require('bcrypt');
const senha = process.argv[2];

bcrypt.hash(senha, 10).then((hash) => {
    console.log(hash);
});