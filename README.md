# Scam Site Detector
You have a project, and you need to make sure scammers aren't creating scam sites that look almost identical to the name of yours but aren't.

How do you solve this? By checking all possible variants of your website's name that someone might use and then hunting the scammers down.

This was successful in finding 4 scam websites for the webaverse drop (and more should they appear!)

# To install
```js
npm install
```

First, make a file called `input.txt` or just edit `input_default.txt`.

Make a list of all possible variants of the domain name you could possibly think someone would fall for.

Now run `npm run detect-scammers`. This will take a while, as it will search through all known TLDs for scammers.

When that is done, it should output a but a URLs to urls_to_check.txt, along with a folder of screenshots.