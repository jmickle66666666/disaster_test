
/**
 *  zone template:
 *  {
 *      parts: [
 *          {
 *              type: "model",
 *              models: [
 *                  {model, position, rotation}, ...
 *              ]
 *          }, 
 *          {
 *              type: "zone",
 *              zonePath: "path/to/zone.zone",
 *              models: [] // baked model references
 *          },
 *          {
 *              type: "etc" // support more arbitrary model types
 *          }
 *          ...
 *      ],
 *      gadgets: [
 *          {
 *              preview: "", // texture or model reference
 *              script: "", // behaviour script path
 *              position: {x, y, z},
 *              properties: {}, // arbitrary extra gadget properties
 *          },
 *      ],
 *      lights: [
 *          {
 *              type: "ambient",
 *              color: {r, g, b},
 *              strength: 1.0
 *          },
 *          {
 *              type: "point",
 *              position: {x, y, z},
 *              color: {r, g, b},
 *              strength: 1.0
 *          },
 *          {
 *              type: "directional",
 *              direction: {x, y, z},
 *              color: {r, g, b},
 *              strength: 1.0
 *          }
 *      ]
 *  }
 * 
 * there is a list of parts, which must have a type and a list of model references
 * the model references are used for rendering and collision for selection
 * 
 * simple parts would be a "cube" which generated based on bounds, or just a straight up model reference
 * parts can be other zones, which would output all the contained models into its models property
 * more complicated could be marching cube or voxel generators, which would store extra data defining how they generate
 * all parts must have a build method which generates the model references given the input data, so they can be built and rebuilt when necessary
 * 
 * optionally a zone could have a baked list of parts, which would be preferred when loading a level not intended for editing
 */

function createNew()
{
    return {
        parts: [],
        gadgets: [],
    };
}

function renderPartWireframe(part, color)
{
    for (var j = 0; j < part.models.length; j++)
    {
        Draw.wireframe(
            part.models[j].model,
            part.models[j].position,
            part.models[j].rotation,
            color,
            true
        );
    }
}

function render(zone)
{
    for(var i = 0; i < zone.parts.length; i++)
    {
        for (var j = 0; j < zone.parts[i].models.length; j++)
        {
            Draw.model(
                zone.parts[i].models[j].model,
                zone.parts[i].models[j].position,
                zone.parts[i].models[j].rotation
            );

            // Draw.wireframe(
            //     zone.parts[i].models[j].position,
            //     zone.parts[i].models[j].rotation,
            //     Color.disaster,
            //     zone.parts[i].models[j].model,
            //     true
            // );
        }
    }
}

function unloadMeshes(zone)
{
    for(var i = 0; i < zone.parts.length; i++)
    {
        for (var j = 0; j < zone.parts[i].models.length; j++)
        {
            Assets.unload(zone.parts[i].models[j].model);
        }
    }
}