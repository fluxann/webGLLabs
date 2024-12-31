export default function Model(gl,shProgram) {
    this.iVertexBuffer = gl.createBuffer();
    this.count = 0;
    this.iTexCor = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTangentBuffer = gl.createBuffer();
    this.iIndexBuffer  = gl.createBuffer();
    this.idTextureDiffuse = loadTexture(gl, "diffuse.jpg");
    this.idTextureNormal = loadTexture(gl, "normal.jpg");
    this.idTextureSpecular = loadTexture(gl, "specular.jpg");


    this.BufferData = function(txc, tang, vertices, normals, indices) { 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tang), gl.STATIC_DRAW);
    
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCor);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(txc), gl.STATIC_DRAW);
    

        this.vertexCount = vertices.length / 3;
        this.indexCount = indices.length;
    }
    

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCor);
        gl.vertexAttribPointer(shProgram.iAttribTex, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTangent);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.idTextureDiffuse);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.idTextureNormal);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.idTextureSpecular);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
    

    function loadTexture(gl, url) {
        var texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    
        var image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = url;
        image.addEventListener('load', () => {
            // copy image to texture memory
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            document.dispatchEvent(new Event('draw'));
        });
        return texture;
    }
    
    
    this.CreateSurfaceData = function() {
        let vertices = [];
        let indices = [];
        let normals = [];
        let tangents = [];
        let tex = []; // To store vertex normals
        let a = 0.6;       // Parameter 'a' for the torus
        let r = 1.2;     // Torus radius
        let vSegments = parseInt(document.getElementById('vGranularity').value);
        let uSegments = parseInt(document.getElementById('uGranularity').value); 
        let theta = 0.25 * Math.PI;
    
        let vertexCount = (uSegments + 1) * (vSegments + 1);
        for (let i = 0; i < vertexCount; i++) {
            normals.push(0, 0, 0);
            tangents.push(0, 0, 0);
        }
    
        

        for (let i = 0; i <= uSegments; i++) {
            let u = -Math.PI + (2 * Math.PI * i) / uSegments;
            let x_u = a * Math.pow(Math.cos(u), 3);
            let z_u = a * Math.pow(Math.sin(u), 3);

            for (let j = 0; j <= vSegments; j++) {
                let v = ( 2 * Math.PI * j) / vSegments;
                let X = (r + x_u * Math.cos(theta) - z_u * Math.sin(theta)) * Math.cos(v);
                let Y = (r + x_u * Math.cos(theta) - z_u * Math.sin(theta)) * Math.sin(v);
                let Z = x_u * Math.sin(theta) + z_u * Math.cos(theta);

                vertices.push(X, Y, Z);
                tex.push(((u / Math.PI) + 1.0) / 2.0, v / (2.0 * Math.PI));
            }
        }
    

        for (let i = 1; i <= uSegments; i++) {
            for (let j = 0; j < vSegments; j++) {
                let current = (i-1) * (vSegments + 1) + j;
                let next = i * (vSegments + 1) + j;

                indices.push(current, next, current + 1);        
                indices.push(current + 1, next, next + 1);      
            }
        }

        
        for (let i = 0; i < indices.length; i += 3) {
            let i1 = indices[i];
            let i2 = indices[i + 1];
            let i3 = indices[i + 2];
    
            let v1 = [vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]];
            let v2 = [vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]];
            let v3 = [vertices[i3 * 3], vertices[i3 * 3 + 1], vertices[i3 * 3 + 2]];

            let uv1 = [tex[i1 * 2], tex[i1 * 2 + 1]];
            let uv2 = [tex[i2 * 2], tex[i2 * 2 + 1]];
            let uv3 = [tex[i3 * 2], tex[i3 * 2 + 1]];
    
            let edge2 = m4.subtractVectors(v3, v1, []);
            let edge1 = m4.subtractVectors(v2, v1, []);
            let deltaUV1 = [uv2[0] - uv1[0], uv2[1] - uv1[1]];
            let deltaUV2 = [uv3[0] - uv1[0], uv3[1] - uv1[1]];
    
            let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

            let normal = m4.normalize(m4.cross(edge1, edge2, []), [0, 0, 0]);
            let tangent = m4.normalize([
                f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]),
                f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]),
                f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2])
            ], [0, 0, 0]);            

            // Add the normal to each vertex of the triangle
            for (let idx of [i1, i2, i3]) {
                normals[idx * 3] += normal[0];
                normals[idx * 3 + 1] += normal[1];
                normals[idx * 3 + 2] += normal[2];

                tangents[idx * 3] += tangent[0];
                tangents[idx * 3 + 1] += tangent[1];
                tangents[idx * 3 + 2] += tangent[2];
            }
        }
    
        // Normalize all vertex normals
        for (let i = 0; i < normals.length; i += 3) {
            let normal = m4.normalize([normals[i], normals[i + 1], normals[i + 2]], [0, 0, 0]);
            normals[i] = normal[0];
            normals[i + 1] = normal[1];
            normals[i + 2] = normal[2];
        }
    
        this.BufferData(tex, tangents,vertices, normals, indices);
    }
}