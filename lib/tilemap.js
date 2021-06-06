function addFunctions(tilemap)
{
    tilemap.autotiles = [16, 32];
    tilemap.render = function (x, y) {
        
        if (this.dirty == undefined || this.dirty) {
            this.dirty = false;
            if (this.buffer != undefined) {
                Assets.unload(this.buffer);
            }
            Draw.startBuffer(this.properties.width * this.properties.tileWidth, this.properties.height * this.properties.tileHeight);
            var rect = {
                x: 0, y: 0, w: this.properties.tileWidth, h: this.properties.tileHeight
            };
            this.properties.textureSize = Assets.getTextureSize(this.properties.texture);
            var a = Math.floor(this.properties.textureSize.w / this.properties.tileWidth);
            for (var i = 0; i < this.properties.width; i++) {
                for (var j = 0; j < this.properties.height; j++) {
                    var id = this.tiles[j * this.properties.width + i];
                    if (this.isAutotile(id)){
                        // autotiles
                        rect.w = this.properties.tileWidth/2;
                        rect.h = this.properties.tileHeight/2;
                        
                        var u = (j != 0 && this.tiles[(j-1) * this.properties.width + i] == id);
                        var d = (j != this.properties.height-1 && this.tiles[(j+1) * this.properties.width + i] == id);
                        var l = (i != 0 && this.tiles[j * this.properties.width + (i-1)] == id);
                        var r = (i != this.properties.width-1 && this.tiles[j * this.properties.width + (i+1)] == id);
    
                        var ul = (j != 0 && i != 0 && this.tiles[(j-1) * this.properties.width + (i-1)] == id);
                        var ur = (j != 0 && i != this.properties.width-1 && this.tiles[(j-1) * this.properties.width + (i+1)] == id);
                        var dl = (j != this.properties.height-1 && i != 0 && this.tiles[(j+1) * this.properties.width + (i-1)] == id);
                        var dr = (j != this.properties.height-1 && i != this.properties.width-1 && this.tiles[(j+1) * this.properties.width + (i+1)] == id);
    
                        var rx = (id % a) * this.properties.tileWidth
                        var ry = Math.floor(id / a) * this.properties.tileHeight;
    
                        var ax = i * this.properties.tileWidth;
                        var ay = j * this.properties.tileHeight;
    
                        // ul
                        rect.x = rx;
                        rect.y = ry;
                        if (!u && !l) {
                            rect.x += this.properties.tileWidth;
                        } else if (u && !l) {
                            rect.x += this.properties.tileWidth * 2;
                        } else if (!u && l) {
                            rect.x += this.properties.tileWidth * 3;
                        } else if (u && l && !ul) {
                            rect.x += this.properties.tileWidth * 4;
                        }
                        Draw.texturePart( ax, ay, rect, this.properties.texture );
    
                        // ur
                        rect.x = rx + this.properties.tileWidth / 2;
                        rect.y = ry;
                        ax += this.properties.tileWidth / 2;
                        
                        if (!u && !r) {
                            rect.x += this.properties.tileWidth;
                        } else if (u && !r) {
                            rect.x += this.properties.tileWidth * 2;
                        } else if (!u && r) {
                            rect.x += this.properties.tileWidth * 3;
                        } else if (u && r && !ur) {
                            rect.x += this.properties.tileWidth * 4;
                        }
                        Draw.texturePart( ax, ay, rect, this.properties.texture );
    
                        // dr
                        rect.x = rx + this.properties.tileWidth / 2;
                        rect.y = ry + this.properties.tileHeight / 2;
                        ay += this.properties.tileHeight / 2;
                        
                        if (!d && !r) {
                            rect.x += this.properties.tileWidth;
                        } else if (d && !r) {
                            rect.x += this.properties.tileWidth * 2;
                        } else if (!d && r) {
                            rect.x += this.properties.tileWidth * 3;
                        } else if (d && r && !dr) {
                            rect.x += this.properties.tileWidth * 4;
                        }
                        Draw.texturePart( ax, ay, rect, this.properties.texture );
    
                        // dl
                        rect.x = rx;
                        rect.y = ry + this.properties.tileHeight / 2;
                        ax -= this.properties.tileWidth / 2;
                        
                        if (!d && !l) {
                            rect.x += this.properties.tileWidth;
                        } else if (d && !l) {
                            rect.x += this.properties.tileWidth * 2;
                        } else if (!d && l) {
                            rect.x += this.properties.tileWidth * 3;
                        } else if (d && l && !dl) {
                            rect.x += this.properties.tileWidth * 4;
                        }
                        Draw.texturePart( ax, ay, rect, this.properties.texture );
    
                        
    
                    } else {
                    
                        // normal tiles
                        rect.w = this.properties.tileWidth;
                        rect.h = this.properties.tileHeight;
                        rect.x = (id % a) * this.properties.tileWidth;
                        rect.y = Math.floor(id / a) * this.properties.tileHeight;
                        Draw.texturePart(
                            i * this.properties.tileWidth, 
                            j * this.properties.tileHeight, 
                            rect, 
                            this.properties.texture
                        );
                    }
                }
            }
            this.buffer = Draw.endBuffer();
        }

        Draw.texture(x, y, this.buffer);

    };

    tilemap.isAutotile = function(id)
    {

        if (this.autotiles == undefined) return false;
        for (var i = 0; i < this.autotiles.length; i++)
        {
            if (this.autotiles[i] == id)
            {
                return true;
            }
        }
        return false;
    }

    tilemap.serialise = function()
    {
        return JSON.stringify(this);
    }

    tilemap.save = function(path) {
        var data = JSON.stringify(this);
        Assets.writeText(path, data);
    }

    tilemap.getTile = function(x, y) {
        if (x < 0) return -1;
        if (y < 0) return -1;
        if (x >= this.properties.width) return -1;
        if (y >= this.properties.height) return -1;
        var tileIndex = y * this.properties.width + x;
        return this.tiles[tileIndex];
    }
}

function create()
{
    var newtilemap = {
        properties : {
            name : "new map",
            texture : "",
            tileWidth : 16,
            tileHeight : 16,
            width : 8,
            height: 8,
            textureSize : null,
            dirty : true
        },
        tiles : [],
        entities : []
    }
    addFunctions(newtilemap);
    return newtilemap;
}

function load(path)
{
    var newtilemap = JSON.parse(Assets.readText(path));
    addFunctions(newtilemap);
    return newtilemap;
}

function deserialise(data)
{
    var newtilemap = JSON.parse(data);
    addFunctions(newtilemap);
    return newtilemap;
}