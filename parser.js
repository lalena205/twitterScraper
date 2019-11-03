const rp = require('request-promise')
const $ = require('cheerio')

const urls = ['https://twitter.com/_markusbraun']
const outputFilePath = './output.json'
const urlRegex = /(http|ftp|https):\/\/\S+/gi

//pic.twitter.com/TWuL5ohr34
const picTwitterRegex = /pic.twitter.com\/\S+/gi

let allTwitts = {}


// Utilities
const init = () => {
    var fs = require('fs')
    fs.writeFile(outputFilePath, '', function(){console.log('done')})
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const scrapAndSleep = async callback => {
    await sleep(2000)
    await callback()
}

const keepOpen = async callback => {
    while (true) {
        await scrapAndSleep(callback)
    }
}


const saveToFile = (data, filePath = './markus.html') => {
    const fs = require('fs')
    fs.appendFile(filePath, data, function(err) {
        if(err) {
            return console.log(err)
        }
    })
}

const readFile = () => {
    const fs = require('fs')
    const path = require('path')
    filePath = path.join(__dirname, 'markus.html');

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            parseContent(data)
        } else {
            console.log(err)
        }
    })
}

// Functionality 

const getTwitts = () => {
    urls.map(url => rp(url)
        .then(function(html){
            console.log('Requested new url ... ')
            parseContent(html)
        })
        .catch(function(err){
        //handle error
        })
    )
}

parseItem = item => {
    let newTwitt = $('.TweetTextSize', item).text().replace('…', '')

    const linkInText = newTwitt.match(urlRegex)
    linkInText && (newTwitt = newTwitt.replace(linkInText, ''))

    const twittPic = newTwitt.match(picTwitterRegex)
    twittPic && (newTwitt = newTwitt.replace(twittPic, ''))

    // TODO update these values
    const ahref = $('.TweetTextSize a', item).attr()
    const pic = 1 //$('.TweetTextSize img', items[index])

    console.log(newTwitt,
        '\n link in text is ', linkInText, 
        '\n twitt pic is ', twittPic, 
        '\n link is ', ahref.href, 
        // '\n pic is ', pic, '\n'
    )

    return {
        text: newTwitt,
        linkInText,
        twittPic
    }
}

const parseContent = data => {
    const items = $('#timeline li.stream-item .js-stream-tweet', data);

   let txt = $('.TweetTextSize', items[1]).html()
//    console.log(txt)

   items.each((index, item) => {
    const twittId = item.attribs['data-item-id']
    // console.log('\n\n\nnew twitt', twittId)

    if ( !allTwitts[twittId] ) {
        allTwitts[twittId] = parseItem(items[index])
        saveToFile(`${JSON.stringify(allTwitts[twittId], null, 2)}\n`, outputFilePath)
    }
   })
}

// Prepare environment
init()

// Uncomment this to run the offline version -> read from local file
// readFile()

// Uncomment this to run the script online but only once (and only get 20 twitts)
// getTwitts()

// Uncomment this to run the script on repeat. 
// You can stop the process in console by Ctrl + C
keepOpen(getTwitts)

