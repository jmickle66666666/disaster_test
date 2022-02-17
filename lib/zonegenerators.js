var vmath = load("lib/vmath.js");

function generate(part)
{
    // TODO: check zone.type exists, and exists as a generator
    unloadMeshes(part);
    part.models = generators[part.type](part);
}

function bake(part)
{
    switch (part.type)
    {
        case "shapeExtrude":
            var vertices = [];
            var indices = [];
            var uvs = [];

            var height = vmath.length(part.extrusion);
            var len = 0;
            var pointCount = part.points.length;
            
            for (var i = 0; i <= pointCount; i++)
            {
                var i1 = i;
                if (i1 >= pointCount) i1 -= pointCount;
                vertices.push(vmath.copy(part.points[i1]));

                // uvs
                uvs.push({x: len*0.5, y:height*0.5});
                var i2 = i1 + 1;
                if (i2 == pointCount) i2 = 0;
                len += vmath.distance(part.points[i1], part.points[i2]);

            }

            len = 0;

            for (var i = 0; i <= pointCount; i++)
            {
                var i1 = i;
                if (i1 >= pointCount) i1 -= pointCount;
                vertices.push(vmath.add(part.points[i1], part.extrusion));

                // uvs
                uvs.push({x: len*0.5, y:0});
                var i2 = i1 + 1;
                if (i2 >= pointCount) i2 -= pointCount;
                len += vmath.distance(part.points[i1], part.points[i2]);
                
            }

            // walls
            //pointCount += 1;
            for (var i = 0; i < (pointCount+0); i++)
            {
                var i1 = i;
                if (i1 >= (pointCount+1)) i1 -= (pointCount+1);
                var i2 = i1 + 1;
                if (i2 >= (pointCount+1)) i2 -= (pointCount+1);
                var i3 = i1 + (pointCount+1);
                var i4 = i2 + (pointCount+1);
                indices.push(i1, i3, i4, i, i4, i2);
            }

            // floor/ ceiling
            var bottomStart = vertices.length;
            var dvn = vmath.getDominantAxisNames(part.extrusion);
            for (var i = 0; i < pointCount; i++)
            {
                vertices.push(vmath.copy(vertices[i]));
                uvs.push({x:vertices[i][dvn.nda]*0.5, y:vertices[i][dvn.ndb]*0.5});
            }
            var topStart = vertices.length;
            for (var i = 0; i < pointCount; i++)
            {
                vertices.push(vmath.copy(vertices[(pointCount*2)-0 - i]));
                uvs.push({x:vertices[i][dvn.nda]*0.5, y:vertices[i][dvn.ndb]*0.5});
            }

            for (var i = 0; i < pointCount-2; i++)
            {
                var i2 = i + 1;
                var i3 = i + 2;
                indices.push(
                    0 + bottomStart,
                    i2 + bottomStart,
                    i3 + bottomStart
                );
                indices.push(
                    0 + topStart,
                    i2 + topStart,
                    i3 + topStart
                );
            }

            return {vertices: vertices, indices:indices, uvs:uvs, texture:part.texture};
    }
}

// generators take a part as an input, and writes the model references to it
var generators = {
    "shapeExtrude" : function(part) {
        
        var meshdata = bake(part);

        return [
            {
                position: vmath.copy(vmath.zero),
                rotation: vmath.copy(vmath.zero),
                model: Assets.createMesh(meshdata)
            }
        ];
    },
    "model" : function(part) {
        return [
            {
                position: vmath.copy(part.position),
                rotation: vmath.copy(part.rotation),
                model: part.modelPath,
            }
        ];
    },
    "mesh" : function(part) {
        part.data.texture = part.texture;
        return [
            {
                position: vmath.copy(vmath.zero),
                rotation: vmath.copy(vmath.zero),
                model: Assets.createMesh(part.data)
            }
        ];
    }
};

function getCenter(part)
{
    switch (part.type) {
        case "shapeExtrude":
            var center = {x:0, y:0, z:0};
            for (var i = 0; i < part.points.length; i++)
            {
                center = vmath.add(center, part.points[i]);
                center = vmath.add(center, vmath.add(part.points[i], part.extrusion));
            }
            center = vmath.mul(center, 1 / (part.points.length * 2));
            return center;
        case "mesh":
            var center = {x:0, y:0, z:0};
            for (var i = 0; i < part.data.vertices.length; i++)
            {
                center = vmath.add(center, part.data.vertices[i]);
            }
            center = vmath.mul(center, 1 / (part.data.vertices.length));
            return center;
    }
}

function move(part, offset)
{
    switch (part.type) {
        case "shapeExtrude":
            for (var i = 0; i < part.points.length; i++)
            {
                part.points[i] = vmath.add(part.points[i], offset);
            }
            generate(part);
            break;
        case "mesh":
            for (var i = 0; i < part.data.vertices.length; i++)
            {
                part.data.vertices[i] = vmath.add(part.data.vertices[i], offset);
            }
            generate(part);
            break;
    }
}

function unloadMeshes(part)
{
    for(var i = 0; i < part.models.length; i++)
    {
        Assets.unload(part.models[i].model);
    }
}

// part creators

function createShapeExtrude(points, extrusion, texture)
{
    // check orientation
    var d1 = vmath.sub(points[1], points[0]);
    var d2 = vmath.sub(points[2], points[0]);
    var cross = vmath.cross(d1, d2);
    var dot = vmath.dot(vmath.normalise(extrusion), cross);
    if (dot > 0) points.reverse();

    var output = {
        type: "shapeExtrude",
        points: points,
        extrusion: extrusion,
        models: [],
        texture: texture
    };

    generate(output);
    // just bake for now
    return output;
    //return createMesh(bake(output), texture);
}

function createMesh(meshdata, texture)
{
    var output = {
        type: "mesh",
        data: meshdata,
        texture: texture,
        models: []
    };

    generate (output);
    return output;
}



