const fs = require('fs');
const readline = require('readline');
const path = require('path');
const xml2js = require('xml2js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function chooseOption() {
  console.log('Choose an option:');
  console.log('1: Fix ymap from hash and item list');
  console.log('2: Merge ytyp XML files');
  console.log('3: Merge ymap XML files');
  console.log('4: Generate "item list.txt"');
  console.log('0: Exit');

  rl.question('Enter the number of the option you want to perform: ', (option) => {
    if (option === '1') {
      // Logic to fix ymap from hash and item list
      rl.question('Enter the directory with item list.txt and hash list.txt files: ', (directory) => {
        const itemFilePath = path.join(directory, 'item list.txt');
        const hashFilePath = path.join(directory, 'hash list.txt');

        if (fs.existsSync(itemFilePath) && fs.existsSync(hashFilePath)) {
          const itemList = readLines(itemFilePath);
          const hashList = readLines(hashFilePath);

          const hashToItem = {};
          for (let i = 0; i < itemList.length; i++) {
            hashToItem[hashList[i]] = itemList[i];
          }

          fs.readdir(directory, (err, files) => {
            if (err) {
              console.error(`Error reading directory: ${err.message}`);
              chooseOption(); // Choose another option
              return;
            }

            files.forEach((file) => {
              if (file.endsWith('.ymap.xml')) {
                const ymapXMLPath = path.join(directory, file);
                const ymapXML = fs.readFileSync(ymapXMLPath, 'utf-8');
                const updatedYMapXML = replaceArchetypeNamesInXML(ymapXML, hashToItem);
                fs.writeFileSync(ymapXMLPath, updatedYMapXML);
                console.log(`YMap XML file '${file}' has been updated.`);
              }
            });

            chooseOption(); // Choose another option
          });
        } else {
          console.log('item list.txt or hash list.txt not found in the specified directory. Please make sure they exist in the directory.');
          chooseOption(); // Choose another option
        }
      });
    } else if (option === '2') {
      // Logic to merge ytyp XML files
      rl.question('Enter the directory with ytyp XML files: ', (directory) => {
        if (!fs.existsSync(directory)) {
          console.log('Directory does not exist.');
          chooseOption(); // Choose another option
          return;
        }
        const mergedYtyp = {
          CMapTypes: {
            extensions: [],
            archetypes: [],
            name: '',
            dependencies: [],
            compositeEntityTypes: []
          }
        };
        fs.readdir(directory, (err, files) => {
          if (err) {
            console.error(`Error reading directory: ${err.message}`);
            chooseOption(); // Choose another option
            return;
          }
          files.forEach((file) => {
            if (file.endsWith('.xml')) {
              const ytypXML = fs.readFileSync(path.join(directory, file), 'utf-8');
              xml2js.parseString(ytypXML, (parseError, parsedYtyp) => {
                if (parseError) {
                  console.error(`Error parsing ytyp XML file: ${parseError.message}`);
                } else {
                  const ytypArchetypes = parsedYtyp.CMapTypes.archetypes[0].Item;
                  if (ytypArchetypes) {
                    mergedYtyp.CMapTypes.archetypes.push(...ytypArchetypes);
                  }
                }
              });
            }
          });
          const builder = new xml2js.Builder();
          const mergedYtypXML = builder.buildObject(mergedYtyp);
          fs.writeFileSync('merged_ytyp.xml', mergedYtypXML);
          console.log('Merged ytyp XML files saved as merged_ytyp.xml');
          chooseOption(); // Choose another option
        });
      });
    } else if (option === '3') {
      // Logic to merge ymap XML files
      rl.question('Enter the directory with ymap XML files: ', (directory) => {
        if (!fs.existsSync(directory)) {
          console.log('Directory does not exist.');
          chooseOption(); // Choose another option
          return;
        }
        const mergedYmap = {
          CMapData: {
            entities: [{
              Item: []
            }]
          }
        };
        fs.readdir(directory, (err, files) => {
          if (err) {
            console.error(`Error reading directory: ${err.message}`);
            chooseOption(); // Choose another option
            return;
          }
          files.forEach((file) => {
            if (file.endsWith('.xml')) {
              const ymapXML = fs.readFileSync(path.join(directory, file), 'utf-8');
              xml2js.parseString(ymapXML, (parseError, parsedYmap) => {
                if (parseError) {
                  console.error(`Error parsing ymap XML file: ${parseError.message}`);
                } else {
                  const ymapEntities = parsedYmap.CMapData.entities[0].Item;
                  if (ymapEntities) {
                    mergedYmap.CMapData.entities[0].Item.push(...ymapEntities);
                  }
                }
              });
            }
          });
          const builder = new xml2js.Builder();
          const mergedYmapXML = builder.buildObject(mergedYmap);
          fs.writeFileSync('merged_ymap.xml', mergedYmapXML);
          console.log('Merged ymap XML files saved as merged_ymap.xml');
          chooseOption(); // Choose another option
        });
      });
    } else if (option === '4') {
      // Logic to generate "item list.txt"
      rl.question('Enter the directory with .ydr files: ', (directory) => {
        const ydrFiles = fs.readdirSync(directory).filter((file) => file.endsWith('.ydr'));
        if (ydrFiles.length > 0) {
          const itemList = ydrFiles.map((file) => path.parse(file).name);
          const itemListPath = path.join(directory, 'item list.txt');
          fs.writeFileSync(itemListPath, itemList.join('\n'));
          console.log('item list.txt has been generated.');
        } else {
          console.log('No .ydr files found in the specified directory.');
        }
        chooseOption(); // Choose another option
      });
    } else if (option === '0') {
      rl.close(); // Exit
    } else {
      console.log('Invalid option.');
      chooseOption(); // Choose another option
    }
  });
}

// Start by choosing an option
chooseOption();

// Define the readLines function to read a file line by line
function readLines(filename) {
  return fs.readFileSync(filename, 'utf-8').split('\n').map((line) => line.trim()).filter(Boolean);
}

function replaceArchetypeNamesInXML(ymapXML, hashToItem) {
  // Function to replace archetype names in YMap XML using the hash-to-item mapping
  const regex = /<archetypeName>([0-9A-Fa-fx]+)<\/archetypeName>/g;
  const updatedYmapXML = ymapXML.replace(regex, (match, p1) => {
    const hash = p1.startsWith('0x') ? p1 : '0x' + p1;
    return `<archetypeName>${hashToItem[hash] || hash}</archetypeName>`;
  });
  return updatedYmapXML;
}
