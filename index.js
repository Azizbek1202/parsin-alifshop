

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}




async function malumotlarniOlish() {
    var hozirgiManzil = document.getElementById("linkInput").value;

    // So'nggi slash belgisini izlaymiz
    var slashIndex = hozirgiManzil.lastIndexOf("/");
    var songgiQism = hozirgiManzil.substring(slashIndex + 1);

    // Oldingi qismni aniqlaymiz
    var oldingiQism = hozirgiManzil.substring(0, slashIndex);

    let pages = 1000;
    let category_name = songgiQism;
    let per_page = 24;
    let result_arr = [];
    let result_links = [];

    // Ichiyalar asinxron ravishda ishlaydigan tsikl
    for (let page = 1; page < pages; page++) {
        try {
            // Fetch so'rovi asinxron ravishda bajariladi va natijani kutilmoqda olish uchun 'await' ishlatiladi
            const res = await fetch(`https://gw.alifshop.uz/web/client/offers?page=${page}&category=${category_name}`, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9,uz;q=0.8,ru;q=0.7",
                    "authorization": "",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "service-token": "service-token-alifshop"
                },
                "referrer": "https://alifshop.uz/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });

            // JSON ko'rinishida javobni olish
            const result = await res.json();
            console.log(result)
            // Ma'lumotlar sonini aniqlash va 'pages' ning qiymatini yangilash
            const totalCount = result?.meta?.total;
            per_page = result?.meta?.per_page;
            pages = totalCount / per_page + 1; // Sahifalarni butun son qilib hisoblash

            // Ma'lumotlarni saqlash
            result_arr.push(...result?.data);

        } catch (error) {
            console.error('Xatolik: ', error);
        }
    }

    writeToExcel(result_arr, category_name);
}


async function writeToExcel(data, name) {
    console.log(data)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${name}`);


    const columnHeaders = ["Id", "Product Id", "Name",  "Partner ID", "Partner name", "Partner slug", "Price", "Quantity", "Review count", "Product"];

    worksheet.addRow(columnHeaders);
    data?.forEach(res => {
        worksheet.addRow([res.id, res.name, res.product.id,  res.partner.id, res.partner.name, `https://alifshop.uz/uz/partners/${res.partner.slug}?partner=${res.partner.slug}`, res.price, res.quantity, res.review_count, `https://alifshop.uz/ru/offer/${res.slug}`]);
    });


    try {
        const currentDate = getCurrentDate();
        const fileName = `${name}_${currentDate}.xlsx`
        const blob = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([blob]), `${fileName}`);
        console.log(`Ma\'lumotlar Excel fayliga yozildi: ${fileName}`);
    } catch (error) {
        console.error('Xatolik:', error);
    }
}

