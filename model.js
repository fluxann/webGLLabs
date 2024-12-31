export default function Model(gl,shProgram) {
    this.iVertexBuffer = gl.createBuffer();
    this.count = 0;


    this.BufferData = function(vertices, normals, indices) { 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        this.iNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
        this.iIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
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
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
    
    
    this.CreateSurfaceData = function() {
        let vertices = [];
        let indices = [];
        let normals = []; // To store vertex normals
        let a = 0.6;       // Parameter 'a' for the torus
        let r = 1.2;     // Torus radius
        let vSegments = parseInt(document.getElementById('vGranularity').value);
        let uSegments = parseInt(document.getElementById('vGranularity').value); 
        let theta = 0.25 * Math.PI;
    
        let vertexCount = (uSegments + 1) * (vSegments + 1);
        for (let i = 0; i < vertexCount; i++) {
            normals.push(0, 0, 0);
        }
    
        

        for (let i = 0; i <= uSegments; i++) {
            let u = -Math.PI + (2 * Math.PI * i) / uSegments;

            if (i === uSegments) u = -Math.PI;

            let x_u = a * Math.pow(Math.cos(u), 3);
            let z_u = a * Math.pow(Math.sin(u), 3);

            for (let j = 0; j <= vSegments; j++) {
                let v = ( 2 * Math.PI * j) / vSegments;

                if (j === vSegments) v = 0; 

                let X = (r + x_u * Math.cos(theta) - z_u * Math.sin(theta)) * Math.cos(v);
                let Y = (r + x_u * Math.cos(theta) - z_u * Math.sin(theta)) * Math.sin(v);
                let Z = x_u * Math.sin(theta) + z_u * Math.cos(theta);

                vertices.push(X, Y, Z);
            }
        }
    

        for (let i = 0; i < uSegments - 1; i++) {
            for (let j = 0; j < vSegments - 1; j++) {
                let current = i * (vSegments + 1) + j;
                let next = (i + 1) * (vSegments + 1) + j;

                indices.push(current, next, current + 1);        
                indices.push(current + 1, next, next + 1);      
            }
        }

        
        for (let j = 0; j < vSegments - 1; j++) {
            let current = (uSegments - 1) * (vSegments + 1) + j;
            let next = j;  

            indices.push(current, next, current + 1);        
            indices.push(current + 1, next, next + 1);      
        }

        for (let i = 0; i < uSegments - 1; i++) {
            let current = i * (vSegments + 1) + (vSegments - 1);
            let next = (i + 1) * (vSegments + 1) + (vSegments - 1);

            indices.push(current, next, i * (vSegments + 1));        
            indices.push(i * (vSegments + 1), next, (i + 1) * (vSegments + 1));  
        }

        let last = (uSegments - 1) * (vSegments + 1) + (vSegments - 1);
        let first = 0;

        indices.push(last, vSegments - 1, uSegments * (vSegments + 1) - 1);
        indices.push(uSegments * (vSegments + 1) - 1, vSegments - 1, first);



        for (let i = 0; i < indices.length; i += 3) {
            let i1 = indices[i];
            let i2 = indices[i + 1];
            let i3 = indices[i + 2];
    
            let v1 = [vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]];
            let v2 = [vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]];
            let v3 = [vertices[i3 * 3], vertices[i3 * 3 + 1], vertices[i3 * 3 + 2]];
    
            let edge1 = subtractVectors(v2, v1);
            let edge2 = subtractVectors(v3, v1);
    
            let normal = cross(edge1, edge2);
            normalize(normal);
            
    
            for (let idx of [i1, i2, i3]) {
                normals[idx * 3] += normal[0];
                normals[idx * 3 + 1] += normal[1];
                normals[idx * 3 + 2] += normal[2];
            }
        }
    
        for (let i = 0; i < normals.length; i += 3) {
            let normal = [normals[i], normals[i + 1], normals[i + 2]];
            normalize(normal);
            normals[i] = normal[0];
            normals[i + 1] = normal[1];
            normals[i + 2] = normal[2];
        }
    
        this.BufferData(vertices, normals, indices);
    }   
    
    function subtractVectors(v2, v1) {
        return [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    }
    
    
    function normalize(v) {
        let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length > 0.001) {
            v[0] /= length;
            v[1] /= length;
            v[2] /= length;
        } else {
            v[0] = 0;
            v[1] = 0;
            v[2] = 0;
        }
    }
    
    function cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
}