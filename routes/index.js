var express = require('express');
var router = express.Router();
const mysql = require('mysql')
const db = require('../dev/conffig/database')
var fs = require('fs');
var session = require('express-session')

//login
router.post('/login', function (req, res, next) {
  let user = req.body.username
  let pass = req.body.pass
  let sql = `select * from admin where username = '${user}'`
  try {
    db.query(sql, (err, response) => {
      if (err)
        console.log(err)
      if (response.length > 0) {
        if (response[0].pass === pass)
          res.json({ message: 'Success' })
        else
          res.json({ message: 'fail' })
      }
      else res.json({ message: 'fail' })
    })
  }
  catch (err) {
    console.log(err)
  }
});
// 

router.get('/', function (req, res, next) {
  res.json('hung')
})

// Upload File 
var re
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '\FileUpload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
async function importExcelDeThi(filePath) {
  try {
    xlsxj = require("xlsx-to-json");
    xlsxj({
      input: filePath,
      output: "output.json"
    }, function (err, result) {
      if (err) {
        return err
      } else {
        result.map((val) => {
          let sql = `INSERT INTO ` + '`cauhoi`' +
            ` VALUES ('null','${val.LCH}', '${val.DE}', '${val.A}', '${val.B}', '${val.C}', '${val.D}','${val.DA}')`
          db.query(sql, (err, res) => {
            if (err) console.log(err)
          })
        })

        return result
      }
    });
  }
  catch (err) {
    console.log(err)
  }
}
var upload = multer({ storage: storage })
router.post('/uploadFile', upload.single('avatar'), function (req, res, next) {
  importExcelDeThi("./FileUpload/" + req.file.originalname).then(() => {
    res.json('success')
  })

})
//

// tạo session
router.use(session({
  secret: 'ma hoa',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 5000 * 60 * 60 * 60 }

}))

router.post('/set_sess', (req, res) => {
  console.log(session.User)
  return res.status(200).json({ status: 'success' })
})

//set session
router.post('/get_sess', (req, res) => {
  //check session
  if (session.User)
    res.json({ message: session.User })
  else
    return res.status(200).json({ status: 'error', session: 'No session' })
})

//destroy session
router.get('/des_sess', (req, res) => {
  //destroy session
  req.session.destroy(function (err) {
    return res.status(200).json({ status: 'success', session: 'cannot access session here' })
  })
})
//


//register

const { body, validationResult } = require('express-validator');


let bcrypt = require('bcrypt')

router.post('/register', [
  body('username', 'dien day du').not().isEmpty(),
  body('pass', 'dien day du').not().isEmpty(),
  body('ten', 'dien day du').not().isEmpty(),
  body('sdt', 'sdt phai la so').isNumeric(),
  body('diachi', 'dien day du').not().isEmpty(),
  body('ngaysinh', 'dien day du').not().isEmpty(),
], function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }
  else {
    let user = req.body.username
    let pass = req.body.pass
    let ten = req.body.ten
    let sdt = req.body.sdt
    let diachi = req.body.diachi
    let ngaysinh = req.body.ngaysinh
    let sql2 = `select * from sinhvien where User = '${user}'`
    try {
      db.query(sql2, (err, response) => {
        if (err)
          console.log(err)
        if (response.length > 0)
          res.json({
            message: 'Tên đăng nhập đã tồn tại'
          })
        else {
          bcrypt.hash(pass, 10, async (err, hash) => {
            if (err) { return next(err); }
            let sql = `INSERT INTO ` + '`sinhvien`' + ` VALUES ('null','${user}', '${hash}', '${ten}', '${sdt}', '${diachi}', '${ngaysinh}')`
            db.query(sql, (err, response) => {
              if (err)
                console.log(err)
              else
                res.json({ message: 'Đăng Ký Thành Công' })
            })
            console.log(sql)
          })
        }
      })
    }
    catch (err) {
      console.log(err)
    }
  }
});
//


//loginUser
router.post('/loginUser', function (req, res, next) {
  console.log(req.body)
  let user = req.body.username
  let pass = req.body.pass
  let sql = `select * from sinhvien where User = '${user}'`
  try {
    db.query(sql, (err, response) => {
      if (err)
        console.log(err)
      if (response.length > 0) {
        let check = bcrypt.compareSync(pass, response[0].Pass)
        if (check === true) {
          session.User = response[0].MaSV
          res.json({ message: 'Success' })
        }
        else
          res.json({ message: 'Sai Mật Khẩu' })
      }
      else res.json({ message: 'Tên Đăng Nhập Không Tồn Tại' })
    })
  }
  catch (err) {
    console.log(err)
  }

});
//


//Tạo Đề 
router.post('/createDe', function (req, res, next) {
  let sl = req.body.SL
  let makt = req.body.MAKT
  let LCH = req.body.LCH
  let sql = `SELECT * FROM cauhoi WHERE `
  LCH.map((res, index) => {
    if (index == 0)
      sql = sql + `LoaiCH = '${res}'`
    else sql = sql + ` or LoaiCH = '${res}'`
  })
  sql = sql + ` ORDER BY RAND() LIMIT ${sl}`
  console.log(sql)
  let ran = Math.random().toString(36).substr(2, 10)
  try {
    db.query(sql, (err, response) => {
      response.map((val) => {
        console.log(val)
        let sql2 = `INSERT INTO ` + '`de`' + ` VALUES ('${ran}','${val.MaCH}','${makt}')`
        db.query(sql2, (errr, res) => {
          if (err) console.log(err)
        })
      })
    })
    res.json({ message: 'Success' })

  }
  catch (err) {
    console.log(err)
  }
});
//

//Tao Ki Thi

router.post('/createKiThi', function (req, res, next) {
  let ten = req.body.tenKT
  let tg = req.body.thoiGianThi
  let sql2 = `select * from kithi where TenKiThi = '${ten}'`
  let sql = `INSERT INTO ` + '`kithi`' + ` VALUES ('null','${ten}','${tg}')`
  try {
    db.query(sql2, (errr, response) => {
      if (errr) console.log(errr)
      if (response.length > 0) {
        res.json({ message: 'Ki Thi Đã Tồn Tại' })
      }
      else db.query(sql, (err) => {
        if (err) console.log(err)
        else res.json({ message: 'Tạo Kì Thi Thành Công' })
      })
    })
  }
  catch (err) {
    console.log(err)
  }
});
// 


// Get_Câu Hỏi 
async function render(arr, ch) {
  let data = await arr.map((val) => {
    let sql2 = `SELECT * from cauhoi WHERE MaCH='${val.MaCH}'`
    db.query(sql2, (err, resp) => {
      if (err) console.log(err)
      else ch.push(resp[0])
    })
  })
  await new Promise(resolve => setTimeout(resolve, 100));
  return ch
}
router.post('/getCauHoi', function (req, res, next) {
  session.mkt = req.body.MaKiThi
  mkt = session.mkt
  let sql = `SELECT MaCH from de AS v INNER JOIN (SELECT MaDe from de WHERE MaKiThi='${mkt}' GROUP BY MaDe ORDER BY RAND() LIMIT 1) as v2 ON v.MaDe = v2.MaDe`
  try {
    db.query(sql, (errr, response) => {
      if (errr) console.log(errr)
      else {
        let cauhoi = []
        render(response, cauhoi).then((rep) => {
          res.json(rep)
        }
        )
      }
    })
  }
  catch (err) {
    console.log(err)
  }
});
//

// Get_KiThi 


router.post('/getKiThi', function (req, res, next) {
  let sql = `select * from KiThi`
  try {
    db.query(sql, (errr, response) => {
      if (errr) console.log(response)
      res.json(response)
    })
  }
  catch (err) {
    console.log(err)
  }
});
//
//Tao Bai Thi
router.post('/taoBaiThi', function (req, res, next) {
  sv = session.User
  let mkt = req.body.MaKiThi
  mabt = Math.floor(Math.random() * Math.floor(10000000))
  let sql = `INSERT INTO ` + '`baithi`' + ` VALUES ('${mabt}',CURRENT_TIMESTAMP,0,'${sv}','${mkt}')`
  try {
    db.query(sql, (errr, response) => {
      if (errr) console.log(errr)
      else session.MaBT = mabt
    })
  }
  catch (err) {
    console.log(err)
  }
});
// 
//Nop Bai
router.post('/nopBai', function (req, res, next) {
  da = req.body.DapAn
  MaCH = req.body.MaCH
  Mabt = session.MaBT
  let sql = `SELECT * from dapanchon WHERE MaCH='${MaCH}' and MaBT='${Mabt}'`
  try {
    db.query(sql, (errr, response) => {
      if (errr) console.log(errr)
      else if (response.length > 0) {
        let sql2 = `UPDATE ` + '`dapanchon`' + ` SET` + ` DapAn='${da}' WHERE MaCH='${MaCH}' and MaBT='${Mabt}'`
        db.query(sql2, (err, ress) => {
          if (err) console.log(err)
        })
      }
      else {
        let sql3 = `INSERT INTO ` + '`dapanchon`' + ` VALUES ('null','${da}','${MaCH}','false','${Mabt}')`
        db.query(sql3, (err, ress) => {
          if (err) console.log(err)
        })
      }
    })
  }
  catch (err) {
    console.log(err)
  }
});
// 


//Chấm Điểm
async function renderDiem() {
  let Mabt = session.MaBT
  let diem = 0
  let sql = `SELECT * from dapanchon where MaBT='${Mabt}'`
  await db.query(sql, (errr, response) => {
    if (errr) console.log(errr)
    else response.map((val) => {
      let sql3 = `SELECT * from cauhoi where MaCH='${val.MaCH}'`
      db.query(sql3, (e, resp) => {
        if (e) console.log(e)
        else if (resp[0].DapAn.toUpperCase() == val.DapAn) {
          diem++
          let sql2 = `UPDATE ` + '`dapanchon`' + ` SET` + ` KetQua='true' WHERE MaCH='${val.MaCH}' and MaBT='${Mabt}'`
          db.query(sql2)
        }
      })
    })
  })
  await new Promise(resolve => setTimeout(resolve, 1000));
  return diem
}

router.post('/chamDiem', function (req, res, next) {
  renderDiem().then((ress) => {
    let Mabt = session.MaBT
    let sql2 = `UPDATE ` + '`baithi`' + ` SET` + ` Diem=${ress} WHERE MaBT='${Mabt}'`
    db.query(sql2)
    res.json(ress)
  })
});
// 

//thống kê
async function renderThongKe() {
  var diem = 0
  var middle = {}
  var arr = []
  let Mabt = session.MaBT
  let sql = `SELECT * from dapanchon where MaBT='${Mabt}'`
  db.query(sql, (errr, response) => {
    if (errr) console.log(errr)
    else response.map((val) => {
      let sql3 = `SELECT * from cauhoi where MaCH='${val.MaCH}'`
      db.query(sql3, (e, resp) => {
        if (e) console.log(e)
        else {
          if (resp[0].DapAn.toUpperCase() == val.DapAn) {
            diem++
          }
          middle = {
            dung: resp[0].DapAn,
            sai: val.DapAn
          }
          arr.push(middle)
        }
      })
    })
  })
  await new Promise(resolve => setTimeout(resolve, 1000));
  let result = {
    socaudung: diem,
    dapanchon: arr
  }
  return result
}

async function thongkeTop(point) {
  point = point.socaudung
  var top = 0
  let sql = `SELECT AVG(Diem),MaSV from baithi GROUP BY MaSV`
  db.query(sql, (errr, response) => {
    if (errr) console.log(errr)
    else {
      response.map((err, res) => {
        if (res.diem < point) top++
      })
    }
  })
  await new Promise(resolve => setTimeout(resolve, 1000));
  let sql3 = `SELECT COUNT(MaSV) from sinhvien`
  db.query(sql3, (e, resp) => {
    top = resp - top
  })
  await new Promise(resolve => setTimeout(resolve, 1000));
  let result = {
    socaudung: diem,
    dapanchon: arr,
    top: top
  }
  return result
}

async function thongkeprev(point) {
  point = point.socaudung
  let masv = session.User
  let phantram
  let sql = `SELECT AVG(Diem),MaSV from baithi where MaSV='${masv}' GROUP BY MaSV`
  db.query(sql, (errr, response) => {
    if (errr) console.log(errr)
    else {
      phantram = point / (point + response) * 100
      if (point < response) {
        phantram = -phantram
      }
    }
  })
  await new Promise(resolve => setTimeout(resolve, 1000));
  let result = {
    socaudung: diem,
    dapanchon: arr,
    top: top,
    phantram: phantram
  }
  return result
}

router.post('/thongkediem', function (req, res, next) {
  console.log('da chay')
  renderThongKe().then((arr) => {
    thongkeTop(arr).then((arr) => {
      thongkeprev(arr).then((arr) => {
        res.send(arr)
      })
    })
  })
});
// 


module.exports = router;
