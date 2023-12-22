# gta 5 map tools batch
 easy way to fix ymaps or other things to use on 3ds max (import)
with this tool you can do the following things:
1: Fix ymap from hash and item list
2: Merge ytyp XML files
3: Merge ymap XML files
4: Generate "item list.txt"

explanation of number 1: normally custom ymaps from mods use well custom models, so they have their own ytyp, and in the ymap instead of the name of the object its a hash. so that ymap importer for 3ds max (and i think blender too?) cant understand these hash so they think its a missing model. this script fixes that by making an item list.txt (just print every item inside a folder into a .txt) so on open iv you can use its tool to generate hash.

# how to use it:
open cmd
select a prompt
paste the directory.

usage of number 4 is simple, have a folder with only the models archives and then paste its directory when prompted
it will generate the item list.txt inside there, then in open IV go to Tools -> Hash generator and select file -> select item list.txt -> generate -> save file -> name it to hash list.txt -> make sure your ymap.xml is there too -> use number 1 to fix it.

or just watch this youtube video https://youtu.be/0dfc5FqCYvw
