const axios = require('axios')
const cheerio = require('cheerio')
const mongoose = require('mongoose')
const Products = require('./models/product')

mongoose.connect(`mongodb://mongo:27017/titan22`, {
    useNewUrlParser: true,
    useCreateIndex: true
})
mongoose.Promise = global.Promise;

async function getProduct(productInfo) {
    try {
        let mongoData = await Products.findOne({ productID: productInfo.productID })
        if (mongoData === null) {
            let webProductData = await axios.get(productInfo.productUrl)
            $$ = cheerio.load(webProductData.data)
            let productData = {
                productCartId: $$('#product_addtocart_form').attr('action').split('/')[7],
                productId: $$('#product_addtocart_form').attr('action').split('/')[9],
                formkey: $$('[name=form_key]').attr('value'),
                sizes: []
            }
            $$('[type="text/x-magento-init"]').each((i, e) => {
                if (i === 9) {
                    productData.sizes = JSON.parse($$(e).html())['#product_addtocart_form'].configurable.spConfig.attributes['139'].options
                }
            })
            console.log(productData)
            await axios.post('https://discordapp.com/api/webhooks/630409123397107736/hkD7W0rnanEug0mvTt_5-AFmaUntHXaLCAdyT_ZOiazoP_zA9H5IU3K-6kERIOKw5oia', {
                embeds: [{
                    title: `${productInfo.productName} - New Product!`,
                    url: productInfo.productUrl,
                    description: `Website: [Titan 22](https://www.titan22.com) \n Price:${productInfo.productPrice}`,
                    thumbnail: {
                        url: productInfo.productImage
                    },
                    fields: productData.sizes.map((size, index) => ({
                        name: `${size.label}:`,
                        value: `[ATC](https://atc.incizzle.ca/titan22/?productcartid=${productData.productCartId}&product=${productData.productId}&form_key=grailgateway&super_attribute[139]=${size.id}&qty=1&selected_configurable_option=${size.products[0]})`,
                        inline: true
                    })),
                    timestamp: new Date(),
                    footer: {
                        icon_url: 'https://cdn.discordapp.com/attachments/589074845862592513/617174859981651973/GRAIL_GATEWAY_TWITTER_TWITTER_PROFILE_PICTURE.png',
                        text: `Powered By: Grail Gateway`
                    }
                }]
            })
            new Products({
                _id: new mongoose.Types.ObjectId(),
                productID: productInfo.productID,
                productName: productInfo.productName
            }).save()
        }
    } catch (error) {
        return null
    }
}

async function startMonitor() {
    let products = []
    let webProducts = await axios.get('https://www.titan22.com/new-arrivals.html')
    $ = cheerio.load(webProducts.data)
    $('.product-item').each(async (i, e) => {
        products.push(getProduct({
            productID: $(e).find('.price-box').attr('data-product-id'),
            productName: $(e).find('.product-item-link').text().trim(),
            productUrl: $(e).find('.product-item-link').attr('href'),
            productImage: $(e).find('.product-image-photo').attr('src'),
            productPrice: $(e).find('span.price').text()
        }))
    })
    await Promise.all(products)
    await new Promise(resolve =>
        setTimeout(resolve, 2000)
    );
    startMonitor()
}

startMonitor()