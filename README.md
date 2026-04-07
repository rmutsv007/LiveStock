# เริ่มต้นใช้งาน Create React App

โปรเจกต์นี้สร้างด้วย [Create React App](https://github.com/facebook/create-react-app)

## คำสั่งที่ใช้งานได้

ในโฟลเดอร์โปรเจกต์ สามารถรันคำสั่งต่อไปนี้:

### `npm start`

รันแอปในโหมด development\
เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูในเบราว์เซอร์

หน้าเว็บจะรีโหลดอัตโนมัติเมื่อมีการแก้ไขโค้ด\
และจะแสดง lint errors ใน console (ถ้ามี)

### `npm test`

รัน test runner ในโหมด interactive watch\
ดูรายละเอียดเพิ่มเติมที่ [การรันเทสต์](https://facebook.github.io/create-react-app/docs/running-tests)

### `npm run build`

สร้าง build สำหรับ production ไว้ในโฟลเดอร์ `build`\
จะ bundle React ในโหมด production และปรับแต่งประสิทธิภาพให้ดีที่สุด

ไฟล์จะถูก minify และชื่อไฟล์จะมี hash\
แอปพร้อมสำหรับการ deploy แล้ว!

ดูรายละเอียดเพิ่มเติมที่ [การ deploy](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run eject`

**หมายเหตุ: คำสั่งนี้ย้อนกลับไม่ได้! เมื่อ `eject` แล้วจะกลับคืนไม่ได้!**

หากไม่พอใจกับ build tool และการตั้งค่าต่างๆ สามารถ `eject` ได้ตลอดเวลา คำสั่งนี้จะลบ build dependency ออกจากโปรเจกต์

แทนที่จะเป็นเช่นนั้น จะคัดลอกไฟล์ config และ dependencies ทั้งหมด (webpack, Babel, ESLint ฯลฯ) เข้ามาในโปรเจกต์โดยตรง เพื่อให้ควบคุมได้เต็มที่ คำสั่งอื่นๆ ยกเว้น `eject` จะยังทำงานได้ปกติ

ไม่จำเป็นต้องใช้ `eject` เสมอไป ชุดฟีเจอร์ที่มีอยู่เพียงพอสำหรับโปรเจกต์ขนาดเล็กถึงกลาง

## เรียนรู้เพิ่มเติม

ดูเพิ่มเติมได้ที่ [เอกสาร Create React App](https://facebook.github.io/create-react-app/docs/getting-started)

เรียนรู้ React ได้ที่ [เอกสาร React](https://reactjs.org/)

### การแบ่งโค้ด (Code Splitting)

ดูรายละเอียดที่: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### การวิเคราะห์ขนาด Bundle

ดูรายละเอียดที่: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### การสร้าง Progressive Web App

ดูรายละเอียดที่: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### การตั้งค่าขั้นสูง

ดูรายละเอียดที่: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### การ Deploy

ดูรายละเอียดที่: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` minify ไม่สำเร็จ

ดูรายละเอียดที่: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
