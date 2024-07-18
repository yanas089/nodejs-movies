const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const cors = require ('cors');
app.use(cors());

const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); // script untuk penggunaan multer saat upload
// create data / insert data
app.post('/api/movies',upload.single('image'),(req, res) => {


    if (!req.file) {
        console.log("No file upload");
        const data = { ...req.body };
        const querySql = 'INSERT INTO tbl_movies (judul,rating,deskripsi,sutradara) values (?,?,?,?);';
        const judul = req.body.judul;
        const rating = req.body.rating;
        const deskripsi = req.body.deskripsi;
        const sutradara = req.body.sutradara;


         
    // jalankan query
    koneksi.query(querySql,[ judul,rating, deskripsi,sutradara], (err, rows, field) => {
    // error handling
    if (err) {
                 return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
// buat variabel penampung data dan query sql
        const data = { ...req.body };
        const querySql = 'INSERT INTO tbl_movies (judul,rating,deskripsi,sutradara,foto) values (?,?,?,?,?);';
        const judul = req.body.judul;
        const rating = req.body.rating;
        const deskripsi = req.body.deskripsi;
        const sutradara = req.body.sutradara;
        const foto =   imgsrc;
        


// jalankan query
koneksi.query(querySql,[ judul,rating, deskripsi,sutradara,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});


app.get('/', (req,res) => {
    res.send('HellO World');
});




// read data / get data
app.get('/api/movies', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM tbl_movies';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});



// filter data
app.get('/api/movies/filter/:judul', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM tbl_movies where judul like \'%' + req.params.judul+ '%\';';
    console.log(querySql);

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// update data
app.put('/api/movies/:id', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM tbl_movies WHERE id = ?';
    const id = req.body.id;
    const judul = req.body.judul;
    const rating = req.body.rating;
    const deskripsi = req.body.deskripsi;
    const sutradara = req.body.sutradara;

    const queryUpdate = 'UPDATE tbl_movies SET judul=?,rating=?,deskripsi=?,sutradara=? WHERE id = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [judul,rating,deskripsi,sutradara, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});


// delete data
app.delete('/api/movies/(:id)', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM tbl_movies WHERE id = ?';
    const queryDelete = 'DELETE FROM tbl_movies WHERE id = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            
            koneksi.query(queryDelete, req.params.nim, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});



app.listen(PORT, () => {
    console.log(`server listening at http://localhost: ${PORT}`)
});

