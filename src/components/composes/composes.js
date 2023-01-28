import db from '@/plugins/firebase.js';

export function getDate() {
    var dt = new Date();
    var bulanArr = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    var getTahun = dt.getFullYear();
    var getBulan = bulanArr[dt.getMonth()];
    var getTanggal = dt.getDate();
    var getJam = dt.getHours().toString().length < 2 ? "0" + dt.getHours().toString() : dt.getHours().toString();
    var getMenit = dt.getMinutes().toString().length < 2 ? "0" + dt.getMinutes().toString() : dt.getMinutes().toString();
    var getSecond = dt.getSeconds().toString().length < 2 ? "0" + dt.getSeconds().toString() : dt.getSeconds().toString();

    var date = `${getBulan}.${getTanggal}.${getTahun}, ${getJam}.${getMenit}.${getSecond}`;

    return date;

}

export function compressImage(image, scale, initialWidth, initialHeight) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.src = image;

        const canvas = document.createElement("canvas");

        canvas.width = scale * initialWidth;
        canvas.height = scale * initialHeight;
        const ctx = canvas.getContext("2d");

        if (image == null) {
            return reject("no image input");
        }

        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.canvas.toBlob((blob) => {
                resolve(blob)
            }, "image/png");
        }
    })
}

export function getBulanDinamis(isText, dariTanggal, keTanggal) {
    var bulanDinamis = [];
    var bulan = [
        {
            text: "Jan",
            angka: "01",
            value: 0,
        },
        {
            text: "Feb",
            angka: "02",
            value: 1,
        },
        {
            text: "Mar",
            angka: "03",
            value: 2,
        },
        {
            text: "Apr",
            angka: "04",
            value: 3,
        },
        {
            text: "Mei",
            angka: "05",
            value: 4,
        },
        {
            text: "Jun",
            angka: "06",
            value: 5,
        },
        {
            text: "Jul",
            angka: "07",
            value: 6,
        },
        {
            text: "Ags",
            angka: "08",
            value: 7,
        },
        {
            text: "Sept",
            angka: "09",
            value: 8,
        },
        {
            text: "Okt",
            angka: "10",
            value: 9,
        },
        {
            text: "Nov",
            angka: "11",
            value: 10,
        },
        {
            text: "Des",
            angka: "12",
            value: 11,
        },
    ]
    const yearInt = parseInt(dariTanggal.split("-")[0]);
    const keYearInt = parseInt(keTanggal.split("-")[0]);
    const valueMultiply = keYearInt > yearInt ? keYearInt + 1 - yearInt : 1;
    var count = 0;
    var plusTheYear = yearInt;
    if (isText) {
        for (let i = 0; i < 12 * valueMultiply; i++) {
            bulanDinamis.push({
                text: bulan[count].text + " " + plusTheYear,
                value: i,
            });

            plusTheYear = count == 11 ? plusTheYear + 1 : plusTheYear;
            count = count == 11 ? -1 : count;
            count++;
        }
    } else {
        for (let i = 0; i < 12 * valueMultiply; i++) {
            bulanDinamis.push({
                text: bulan[count].angka + " " + plusTheYear,
                value: i
            });
            plusTheYear = count == 11 ? plusTheYear + 1 : plusTheYear;
            count = count == 11 ? -1 : count;
            count++;
        }
    }

    return bulanDinamis;
}

export async function getHargaPokokPenjualan(bulanSebelumnya, dariTanggal, keTanggal) {
    const getDate = dariTanggal.split("-");
    const date = getDate[1] + "." + "01" + "." + getDate[0];
    const getKeDate = keTanggal.split("-");
    const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];

    const keDateBeforeNine = (parseInt(getDate[1]) - 1) + "." + "01" + "." + getKeDate[0];
    const keDateBefore = keDateBeforeNine.length < 10 ? '0' + keDateBeforeNine : keDateBeforeNine;

    // get barang masuk dari database
    let getPersediaanAwal = null;
    if (bulanSebelumnya) {
        getPersediaanAwal = await getWithSort(keDateBefore, date, 'barang_masuk', false);
    } else {
        getPersediaanAwal = await getWithSort(date, keDate, 'barang_masuk', false);
    }

    let totalPersediaanAwal = 0; // total Persediaan Awal Barang
    let getTanggalPalingAwal = [{ created_at: date }]
    console.log('persediaan awal ', getPersediaanAwal);
    if (getPersediaanAwal.length != 0) {
        if (bulanSebelumnya) {
            getTanggalPalingAwal = getPersediaanAwal.filter((palingAwal) => {
                if (palingAwal.created_at.substr(0, 9) == keDateBefore) {
                    return palingAwal.created_at.substr(0, 9) //tanggalPalingAwalBulanSebelumnya
                }
                return palingAwal.created_at.substr(0, 9) == getPersediaanAwal[0].created_at.substr(0, 9) //tanggalPalingAwalBulanSebelumnya
            }) 
        } else {
            getTanggalPalingAwal = getPersediaanAwal.filter((palingAwal) => {
                if (palingAwal.created_at.substr(0, 9) == date) {
                    return palingAwal.created_at.substr(0, 9) //tanggalPalingAwal
                }
                return palingAwal.created_at.substr(0, 9) == getPersediaanAwal[0].created_at.substr(0, 9) //tanggalPalingAwalBulanSebelumnya
            })
        }
        console.log('tanggal pling awal : ', getTanggalPalingAwal);
        // get total persediaan awal yang telah didapat
        for (const hargaBeli of getTanggalPalingAwal) {
            totalPersediaanAwal += hargaBeli.harga_beli_barang_masuk;
        }
    }

    console.log('total persediaan awal:', totalPersediaanAwal);
    console.log('tgloo ', getTanggalPalingAwal[getTanggalPalingAwal.length - 1].created_at.substr(0, 10))
    // get persediaan baru dari database
    let getPersediaanBaru = null;
    if (bulanSebelumnya) {
        getPersediaanBaru = await getWithSortStartAfter(getTanggalPalingAwal[getTanggalPalingAwal.length - 1].utcDate, date, 'barang_masuk', false)
    } else {
        getPersediaanBaru = await getWithSortStartAfter(getTanggalPalingAwal[getTanggalPalingAwal.length - 1].utcDate, keDate, 'barang_masuk', false);
        console.log('getPersediaanBaru : ', getPersediaanBaru);
    }

    // get total persediaan baru yang telah didapat dari database 
    let totalPersediaanBaru = 0; // total persediaan baru barang
    getPersediaanBaru.forEach((persediaanBaru) => {
        totalPersediaanBaru += persediaanBaru.harga_beli_barang_masuk
    })
    console.log('total persediaan baru: ', totalPersediaanBaru)
    // get persediaan barang yang sekarang
    let totalPersediaanSekarang = 0; // total persediaan barang sekarang
    const getPersediaanSekarang = await db.collection('produk').get();
    getPersediaanSekarang.forEach((persediaanSekarang) => {
        let harga_produk_dikali_stok = parseInt(persediaanSekarang.data().harga) * parseInt(persediaanSekarang.data().stokProduk)
        totalPersediaanSekarang += harga_produk_dikali_stok
    })
    console.log('total persediaan sekarang: ', totalPersediaanSekarang)
    // get harga pokok penjualan
    let harga_pokok_penjualan = totalPersediaanBaru + totalPersediaanAwal - totalPersediaanSekarang

    return harga_pokok_penjualan
}

function convertToUtC(tanggal) {
    let getArray = tanggal.created_at.split(',');
    let getCalenderArray = getArray[0].split('.');
    let getSecondsArray = getArray[1].split('.');
    let time = `${getCalenderArray[2]}-${getCalenderArray[0]}-${getCalenderArray[1]}T${getSecondsArray[0]}:${getSecondsArray[1]}:${getSecondsArray[2]}`
    let createUTCDate = new Date(time.split(" ").join(''));
    let getUTCTimes = createUTCDate.getTime();

    return getUTCTimes;
}

function convertToUtCNoSeconds(tanggal) {
    let getCalenderArray = tanggal.split('.');
    let time = `${getCalenderArray[2]}-${getCalenderArray[0]}-${getCalenderArray[1]}T00:00:00`
    let createUTCDate = new Date(time.split(" "));
    let getUTCTimes = createUTCDate.getTime();

    return getUTCTimes;
}

export async function getWithSort(dariTanggal, keTanggal, collection, withConditional = true) {
    let getAllPemesanan = null;

    if (!withConditional) {
        let getAll = await db.collection(collection).get();
        getAllPemesanan = getAll.docs;
    } else {
        let getAllPemesananShipped = await db.collection(collection).where('status', '==', 'shipped').get();
        let getAllPemesananDiterima = await db.collection(collection).where('status', '==', 'diterima').get();

        getAllPemesanan = getAllPemesananShipped.docs.concat(getAllPemesananDiterima.docs);
    }

    const date = convertToUtCNoSeconds(dariTanggal);
    const keDate = convertToUtCNoSeconds(keTanggal);
    const reconstruct = getAllPemesanan.map(pesanan => {
        let getUTCTimes = convertToUtC(pesanan.data());
        return { ...pesanan.data(), utcDate: getUTCTimes };
    })

    let sortTanggal = reconstruct.sort((a, b) => a.utcDate - b.utcDate);
    let filterTanggal = sortTanggal.filter((dat) => {
        return dat.utcDate >= date && dat.utcDate <= keDate
    })

    return filterTanggal;
}

export async function getWithSortStartAfter(dariTanggal, keTanggal, collection, withConditional = true) {
    let getAllPemesanan = null;

    if (!withConditional) {
        let getAll = await db.collection(collection).get();
        getAllPemesanan = getAll.docs;
    } else {
        let getAllPemesananShipped = await db.collection(collection).where('status', '==', 'shipped').get();
        let getAllPemesananDiterima = await db.collection(collection).where('status', '==', 'diterima').get();

        getAllPemesanan = getAllPemesananShipped.docs.concat(getAllPemesananDiterima.docs);
    }

    const keDate = convertToUtCNoSeconds(keTanggal);
    const reconstruct = getAllPemesanan.map(pesanan => {
        let getUTCTimes = convertToUtC(pesanan.data());
        return { ...pesanan.data(), utcDate: getUTCTimes };
    })

    let sortTanggal = reconstruct.sort((a, b) => a.utcDate - b.utcDate);
    let filterTanggal = sortTanggal.filter((dat) => {
        return dat.utcDate > dariTanggal && dat.utcDate <= keDate
    })

    return filterTanggal;
}

export async function getLabaKotor(dariTanggal, keTanggal) {
    const getDate = dariTanggal.split("-");
    // bulan.tanggal.tahun
    const date = getDate[1] + "." + "01" + "." + getDate[0];
    const getKeDate = keTanggal.split("-");
    const keDate = getKeDate[1] + "." + "31" + "." + getKeDate[0];

    let getTotalLabaKotor = await getWithSort(date, keDate, 'pemesanan');
    const keDateBeforeNine = (parseInt(getDate[1]) - 1) + "." + "01" + "." + getKeDate[0];
    const keDateBefore = keDateBeforeNine.length < 10 ? '0' + keDateBeforeNine : keDateBeforeNine;
    let getSatuBulanSebelumnya = await getWithSort(keDateBefore, date, 'pemesanan');
    
    let totalLabaKotor = 0;
    let totalPenjualan = 0;
    let hargaPokokPenjualan = await getHargaPokokPenjualan(false, dariTanggal, keTanggal);

    getTotalLabaKotor.forEach((TotLabaKotor) => {
        totalPenjualan += parseInt(TotLabaKotor.subtotal) - parseInt(TotLabaKotor.ongkir);
    })
    console.log("total penjualan :", totalPenjualan);
    console.log("harga pokok :", hargaPokokPenjualan);

    // get laba kotor
    totalLabaKotor = totalPenjualan - hargaPokokPenjualan;

    // get laba kotor before
    let totalPenjualanBefore = 0;
    hargaPokokPenjualan = 0;
    getSatuBulanSebelumnya.forEach((TotLabaKotor) => {
        totalPenjualanBefore += parseInt(TotLabaKotor.subtotal) - parseInt(TotLabaKotor.ongkir);
    })

    hargaPokokPenjualan = await getHargaPokokPenjualan(true, dariTanggal, keTanggal);

    // // get laba kotor sebelumnya
    let totalLabaKotorBefore = totalPenjualanBefore - hargaPokokPenjualan;

    // // get persentase -/+ laba kotor bulan sebelumnya
    let selisihLabakotor = totalLabaKotor - totalLabaKotorBefore;
    if(totalLabaKotorBefore > totalLabaKotor) {
        selisihLabakotor = totalLabaKotorBefore - totalLabaKotor
    }
    let rasio = totalLabaKotorBefore == 0 ? 1 : selisihLabakotor / totalLabaKotorBefore;
    let persentaseKenaikanLabaKotor = rasio * 100;

    const object = {
        persentaseKenaikanLabaKotor: totalLabaKotorBefore > totalLabaKotor ? '-' + Math.floor(persentaseKenaikanLabaKotor) : Math.floor(persentaseKenaikanLabaKotor),
        labaKotor: totalLabaKotor,
        labaKotorSebelumnya: totalLabaKotorBefore
    }

    return object;
}