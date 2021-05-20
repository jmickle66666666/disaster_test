function create()
{
    return {
        properties : {
            texture : "",
            tileWidth : 16,
            tileHeight : 16,
            width : 8,
            height: 8,
            textureSize : null
        },
        tiles : [],
        render: function (x, y) {
            var rect = {
                x: 0, y: 0, w: this.properties.tileWidth, h: this.properties.tileHeight
            };
            this.properties.textureSize = Assets.getTextureSize(this.properties.texture);
            var a = Math.floor(this.properties.textureSize.w / this.properties.tileWidth);
            for (var i = 0; i < this.properties.width; i++) {
                for (var j = 0; j < this.properties.height; j++) {
                    var id = this.tiles[j * this.properties.width + i]
                    rect.x = (id % a) * this.properties.tileWidth;
                    rect.y = Math.floor(id / a) * this.properties.tileHeight;
                    Draw.texturePart(
                        x + i * this.properties.tileWidth, 
                        y + j * this.properties.tileHeight, 
                        rect, 
                        this.properties.texture
                    )
                }
            }
        }
    }
}