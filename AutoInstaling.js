const puppeteer = require('puppeteer-core');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const credentialsPath = path.resolve(process.cwd(), 'credentials.json');
const wordsFilePath = path.resolve(process.cwd(), 'words.txt');


const { login, password, sessionCount } = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));


// Read the words file and split into arrays
function readWordsFile() {
    const wordsText = fs.readFileSync(wordsFilePath, 'utf-8');
    const wordsArray = wordsText.split('\n');
    let slArray = [], odArray = [], exArray = [];

    wordsArray.forEach(word => {
        if (word.includes(' -- ')) {
            const [sl, odex] = word.split(' -- ');
            const [od, ex] = odex.split(' / ');

            if (sl && od) {
                slArray.push(sl.trim());
                odArray.push(od.trim());
            }
            if (ex) {
                exArray.push(ex.trim());
            }
        }
    });

    return { slArray, odArray, exArray };
}

// Write updated words back to the words file
function writeWordsFile(words) {
    fs.writeFileSync(wordsFilePath, words.join('\n'), 'utf-8');
}

async function sessionMaker(login, password, runInBrowser, i) {
    const { slArray, odArray, exArray } = readWordsFile();

    // Launch Microsoft Edge with Puppeteer Core
    const browser = await puppeteer.launch({
        headless: !runInBrowser,
        executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' // Path to Edge executable
    });

    const page = await browser.newPage();

    await page.goto('https://instaling.pl/teacher.php?page=login');
    await page.click('.fc-button.fc-cta-consent.fc-primary-button');
    await page.type('#log_email', login);
    await page.type('#log_password', password);
    await page.click('button[type="submit"]');

    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
        await page.click('.big_button.btn.btn-session.sesion.blink_me');
    } catch {
        await page.click('.big_button');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        await page.click('#start_session_button');
        console.log(`Starting session ${i}`);
    } catch {
        await page.click('#continue_session_button');
        console.log(`Continuing session ${i}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    let numWordsGuessed = 0;

    const updateOutput = (numWordsGuessed) => {
        process.stdout.write(`\rGuessed ${numWordsGuessed} word${numWordsGuessed !== 1 ? 's' : ''} in session ${i}`);
    };
    try {
        while (await page.evaluate(() => document.querySelector("#session_result").innerHTML) === "") {
            for (let j = 0; j < slArray.length; j++) {
                const sl = await page.evaluate(() => document.querySelector("div.translations").innerHTML);
                const ex = await page.evaluate(() => document.querySelector("div.usage_example").innerHTML);
    
                if (sl === slArray[j] && ex === exArray[j]) {
                    numWordsGuessed++;
                    updateOutput(numWordsGuessed);
                    await page.type('#answer', odArray[j]);
                    break;
                }
            }
    
            // Push the new example and translation data to arrays
            exArray.push(await page.evaluate(() => document.querySelector("div.usage_example").innerHTML));
    
            // Click check and handle any errors that may arise
            try {
                await page.click('#check');
            } catch (err) {
               
                try {
                    await page.click('#know_new');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await page.click('#skip');
                } catch (skipErr) {
                    
                }
            }
    
            // Delay to allow the page to update properly
            await new Promise(resolve => setTimeout(resolve, 1500));
    
            // Update arrays with new data
            slArray.push(await page.evaluate(() => document.querySelector("#answer_translations.translations").innerHTML));
            odArray.push(await page.evaluate(() => document.querySelector("#word").innerHTML));
    
            // Attempt to click the 'nextword' button, retry if failed
            try {
                await page.click('#nextword');
            } catch (err) {
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                try {
                    await page.click('#check');
                } catch (checkErr) {
                    
                }
            }
    
            // Additional delay before looping again
            await new Promise(resolve => setTimeout(resolve, 2500));
        }
    } catch (outerErr) {
        
    
        // Outer catch block to handle session-level failures
        try {
            await page.click('#check');
        } catch (finalErr) {
            
            try {
                await page.click('#nextword');
            } catch (nextWordErr) {
                
            }
        }
    }
    
    console.log(`\nSession ${i} ended successfully.`);
    

    const sessionResult = await page.evaluate(() => document.querySelector("#session_result").innerHTML);
    const match = sessionResult.match(/Dni pracy w tym tygodniu: (\d+)/);
    if (match) {
        console.log(`\nDays of done sessions this week: ${match[1]}`);
        rl.question("Press any key to exit...\n", () => {
            rl.close();
        });
    }

    try {
        await page.click('#return_mainpage');
    } catch {
        console.log("Starting another session..");
    }

    await browser.close();

    // Write the updated words
    const words = slArray.map((sl, index) => `${sl} -- ${odArray[index]} / ${exArray[index]}`);
    writeWordsFile([...new Set(words)]);
}

async function runSessions(login, password, sessionCount, runInBrowser) {
    for (let i = 1; i <= sessionCount; i++) {
        await sessionMaker(login, password, runInBrowser, i);
    }
}

console.log("Reading config file, please wait...");
console.log("Login:", login);
console.log("Password:", password);
console.log("Session count:", sessionCount);
runSessions(login, password, sessionCount, true).catch((error) => console.error(error));


// Wait for any key press to exit
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


