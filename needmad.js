var programInfo = [];
function newparticle() {
    return {
        loaded: 0,
        x: 0,
        y: 0,
        z: 0,
        mat: null,
        ni: 0,
        alpha: false,
        copyonly: false
    };
}
function loadparticle(file, rad) {
    rad.loaded = 0;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var readlines = allText.split('\n');
                var copyvert = false;
                var indice = [];
                var vert = [];
                var gradetyp = 0;
                var cgr = [255, 255, 0, 255, 255, 0, 0, 255];
                var scale = 1;
                var mid = [0, 0, 0];
                for (var i = 0; i < readlines.length; i++) {
                    var line = readlines[i].trim();
                    if (strtsWith(line, "scale")) {
                        scale = getFloatValue("scale", line, 0);
                    }
                    if (strtsWith(line, "copyonly()")) {
                        rad.copyonly = true;
                    }
                    if (strtsWith(line, "copyvert()")) {
                        copyvert = true;
                    }
                    if (strtsWith(line, "midx")) {
                        mid[0] = (getFloatValue("midx", line, 0) * scale);
                    }
                    if (strtsWith(line, "midy")) {
                        mid[1] = (getFloatValue("midy", line, 0) * scale);
                    }
                    if (strtsWith(line, "midz")) {
                        mid[2] = (getFloatValue("midz", line, 0) * scale);
                    }
                    if (strtsWith(line, "enableAlpha()")) {
                        rad.alpha = true;
                    }
                    if (strtsWith(line, "xgrade")) {
                        gradetyp = 0;
                        for (var k = 0; k < 8; k++) {
                            cgr[k] = getIntValue("xgrade", line, k);
                        }
                    }
                    if (strtsWith(line, "ygrade")) {
                        gradetyp = 1;
                        for (var k = 0; k < 8; k++) {
                            cgr[k] = getIntValue("ygrade", line, k);
                        }
                    }
                    if (strtsWith(line, "zgrade")) {
                        gradetyp = 2;
                        for (var k = 0; k < 8; k++) {
                            cgr[k] = getIntValue("zgrade", line, k);
                        }
                    }
                    if (line.indexOf("v(") != -1) {
                        line = line.substring(2, line.indexOf(")v"));
                        var arr = line.split(',');
                        for (var k = 0; k < arr.length; k++) {
                            vert[k] = parseFloat(arr[k]);
                        }
                        if (rad.copyonly || copyvert) {
                            rad.vert = vert;
                        }
                    }
                    if (line.indexOf("p(") != -1) {
                        line = line.substring(2, line.indexOf(")p"));
                        var arr = line.split(',');
                        for (var k = 0; k < arr.length; k++) {
                            indice[k] = parseInt(arr[k]);
                        }
                        if (rad.copyonly) {
                            rad.indice = indice;
                        }
                    }
                }
                if (!rad.copyonly) {
                    rad.ni = indice.length;
                    if (scale != 1) {
                        for (var i = 0; i < vert.length; i++) {
                            vert[i] *= scale;
                        }
                    }
                    rad.vbuf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, rad.vbuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
                    var col = [];
                    for (var i = 0; i < (vert.length / 3); i++) {
                        var shf = 0;
                        if (gradetyp <= 2) {
                            if (vert[((i * 3) + gradetyp)] < mid[gradetyp]) {
                                shf = 4;
                            }
                        }
                        for (var k = 0; k < 4; k++) {
                            col[((i * 4) + k)] = (cgr[(shf + k)] / 255);
                        }
                    }
                    rad.cbuf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, rad.cbuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
                    rad.ibuf = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rad.ibuf);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice), gl.STATIC_DRAW);
                    rad.mat = mat4.create();
                }
                rad.loaded = 1;
            }
        }
    };
    rawFile.send(null);
}
function newrad3D() {
    return {
        loaded: 0,
        x: 0,
        y: 0,
        z: 0,
        mat: null,
        ont: 0,
        ni: 0,
        nt: 0,
        tgn: 0,
        alpha: 0,
        ownlight: false,
        ownshade: false
    };
}
function loadrad3D(file, rad) {
    rad.loaded = 0;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var readlines = allText.split('\n');
                rad.colrad = 0;
                rad.iscar = 0;
                rad.intershad = false;
                rad.interact = false;
                rad.copyonly = false;
                rad.skid = -1;
                var vrt = [];
                var nrm = [];
                var tex = [];
                var tri = [];
                var texufile = [];
                texufile[0] = "none";
                var bcr = 128,
                bcg = 128,
                bcb = 128,
                bca = 255;
                var scale = 1;
                var scaleX = 1;
                var flipx = -1;
                for (var i = 0; i < readlines.length; i++) {
                    var line = readlines[i].trim();
                    if (strtsWith(line, "flipX()")) {
                        flipx = 1;
                    }
                    if (strtsWith(line, "scale")) {
                        scale = getFloatValue("scale", line, 0);
                    }
                    if (strtsWith(line, "Xscale")) {
                        scaleX = getFloatValue("Xscale", line, 0);
                    }
                    if (strtsWith(line, "enableAlpha()")) {
                        rad.alpha = 1;
                    }
                    if (strtsWith(line, "ownLight()")) {
                        rad.ownlight = true;
                    }
                    if (strtsWith(line, "ownShade()")) {
                        rad.ownshade = true;
                    }
                    if (strtsWith(line, "car()")) {
                        rad.iscar = 1;
                        rad.alpha = 1;
                    }
                    if (strtsWith(line, "skid")) {
                        rad.skid = getIntValue("skid", line, 0);
                        rad.sx = 0;
                        rad.bx = 0;
                        rad.sz = 0;
                        rad.bz = 0;
                    }
                    if (strtsWith(line, "intershad()")) {
                        rad.intershad = true;
                        if (rad.dam == null) {
                            rad.dam = 1;
                        }
                        rad.bndmax = 20;
                        rad.walarc = 0.67;
                    }
                    if (strtsWith(line, "interact()")) {
                        rad.interact = true;
                        if (rad.dam == null) {
                            rad.dam = 1;
                        }
                        rad.bndmax = 20;
                        rad.walarc = 0.67;
                    }
                    if (strtsWith(line, "dam()")) {
                        rad.dam = 3;
                    }
                    if (strtsWith(line, "bndmax")) {
                        rad.bndmax = getFloatValue("bndmax", line, 0);
                    }
                    if (strtsWith(line, "walarc")) {
                        rad.walarc = getFloatValue("walarc", line, 0);
                    }
                    if (strtsWith(line, "copyonly()")) {
                        rad.copyonly = true;
                    }
                    if (strtsWith(line, "texture")) {
                        texufile[rad.nt] = "data/3D/textures/" + getStringValue("texture", line, 0);
                        rad.nt++;
                    }
                    if (strtsWith(line, "intertexture")) {
                        texufile[rad.nt] = "data/interface" + rdres + "/" + getStringValue("intertexture", line, 0);
                        rad.nt++;
                    }
                    if (strtsWith(line, "grouptexture")) {
                        rad.tgn = (getIntValue("grouptexture", line, 0) + 1);
                    }
                    if (line.indexOf("v(") != -1) {
                        line = line.substring(2, line.indexOf(")v"));
                        var arr = line.split(',');
                        for (var k = 0; k < arr.length; k++) {
                            vrt[k] = parseFloat(arr[k]);
                        }
                        if (rad.copyonly || rad.intershad || rad.interact || rad.iscar) {
                            rad.vrt = vrt;
                        }
                    }
                    if (line.indexOf("n(") != -1) {
                        line = line.substring(2, line.indexOf(")n"));
                        var arr = line.split(',');
                        for (var k = 0; k < arr.length; k++) {
                            nrm[k] = parseFloat(arr[k]);
                        }
                        if (rad.copyonly || rad.intershad || rad.interact) {
                            rad.nrm = nrm;
                        }
                    }
                    if (line.indexOf("t(") != -1) {
                        line = line.substring(2, line.indexOf(")t"));
                        var arr = line.split(',');
                        for (var k = 0; k < arr.length; k++) {
                            tex[k] = parseFloat(arr[k]);
                        }
                        if (rad.copyonly || rad.iscar) {
                            rad.tex = tex;
                        }
                    }
                    if (line.indexOf("p(") != -1) {
                        line = line.substring(2, line.indexOf(")p"));
                        var arr = line.split(',');
                        for (var k = 0; k < arr.length; k++) {
                            tri[k] = parseInt(arr[k]);
                        }
                        if (rad.copyonly || rad.intershad || rad.interact || rad.iscar) {
                            rad.tri = tri;
                        }
                    }
                }
                if (!rad.copyonly) {
                    if (rad.nt == 0) {
                        rad.nt = 1;
                    }
                    rad.ni = (tri.length / 3);
                    if (scale != 1) {
                        for (var i = 0; i < vrt.length; i++) {
                            vrt[i] *= scale;
                        }
                    }
                    if (scaleX != 1) {
                        for (var i = 0; i < vrt.length; i += 3) {
                            vrt[i] *= scaleX;
                        }
                        rad.vrt = vrt;
                    }
                    var indice = [];
                    var vert = [];
                    var norm = [];
                    var texu = [];
                    rad.bx = 0;
                    rad.by = 0;
                    rad.bz = 0;
                    for (var i = 0; i < rad.ni; i++) {
                        indice[i] = i;
                        vert[(i * 3)] = (vrt[(tri[(i * 3)] * 3)] * flipx);
                        vert[((i * 3) + 1)] = vrt[((tri[(i * 3)] * 3) + 1)];
                        vert[((i * 3) + 2)] = vrt[((tri[(i * 3)] * 3) + 2)];
                        var tcrad = Math.sqrt((vert[(i * 3)] * vert[(i * 3)]) + (vert[((i * 3) + 1)] * vert[((i * 3) + 1)]) + (vert[((i * 3) + 2)] * vert[((i * 3) + 2)]));
                        if (tcrad > rad.colrad) {
                            rad.colrad = tcrad;
                        }
                        if (Math.abs(vert[(i * 3)]) > rad.bx) {
                            rad.bx = Math.abs(vert[(i * 3)]);
                        }
                        if (Math.abs(vert[((i * 3) + 1)]) > rad.by) {
                            rad.by = Math.abs(vert[((i * 3) + 1)]);
                        }
                        if (Math.abs(vert[((i * 3) + 2)]) > rad.bz) {
                            rad.bz = Math.abs(vert[((i * 3) + 2)]);
                        }
                        if (rad.skid != -1) {
                            if (rad.sx == 0 || vert[(i * 3)] < rad.sx) {
                                rad.sx = vert[(i * 3)];
                            }
                            if (rad.bx == 0 || vert[(i * 3)] > rad.bx) {
                                rad.bx = vert[(i * 3)];
                            }
                            if (rad.sz == 0 || vert[((i * 3) + 2)] < rad.sz) {
                                rad.sz = vert[((i * 3) + 2)];
                            }
                            if (rad.bz == 0 || vert[((i * 3) + 2)] > rad.bz) {
                                rad.bz = vert[((i * 3) + 2)];
                            }
                        }
                        if ((!rad.ownlight) && (!rad.ownshade)) {
                            norm[(i * 3)] = nrm[(tri[((i * 3) + 1)] * 3)];
                            norm[((i * 3) + 1)] = nrm[((tri[((i * 3) + 1)] * 3) + 1)];
                            norm[((i * 3) + 2)] = nrm[((tri[((i * 3) + 1)] * 3) + 2)];
                        }
                        texu[(i * 2)] = tex[(tri[((i * 3) + 2)] * 2)];
                        texu[((i * 2) + 1)] = (1 - tex[((tri[((i * 3) + 2)] * 2) + 1)]);
                    }
                    rad.vbuf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, rad.vbuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
                    if ((!rad.ownlight) && (!rad.ownshade)) {
                        rad.nbuf = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, rad.nbuf);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);
                    }
                    rad.tbuf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, rad.tbuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texu), gl.STATIC_DRAW);
                    rad.ibuf = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rad.ibuf);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice), gl.STATIC_DRAW);
                    rad.loaded = 1;
                    rad.mat = mat4.create();
                    if (!rad.tgn) {
                        if (texufile[0] != "none") {
                            if (rad.nt == 1) {
                                var image = new Image();
                                image.onload = function () {
                                    rad.texture = gl.createTexture();
                                    gl.bindTexture(gl.TEXTURE_2D, rad.texture);
                                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                                    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                                        gl.generateMipmap(gl.TEXTURE_2D);
                                    } else {
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                    }
                                    rad.loaded++;
                                };
                                image.src = texufile[0];
                            } else {
                                rad.texture = [];
                                var image0 = new Image();
                                image0.onload = function () {
                                    rad.texture[0] = gl.createTexture();
                                    gl.bindTexture(gl.TEXTURE_2D, rad.texture[0]);
                                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image0);
                                    if (isPowerOf2(image0.width) && isPowerOf2(image0.height)) {
                                        gl.generateMipmap(gl.TEXTURE_2D);
                                    } else {
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                    }
                                    rad.loaded++;
                                };
                                image0.src = texufile[0];
                                var image1 = new Image();
                                image1.onload = function () {
                                    rad.texture[1] = gl.createTexture();
                                    gl.bindTexture(gl.TEXTURE_2D, rad.texture[1]);
                                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
                                    if (isPowerOf2(image1.width) && isPowerOf2(image1.height)) {
                                        gl.generateMipmap(gl.TEXTURE_2D);
                                    } else {
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                    }
                                    rad.loaded++;
                                };
                                image1.src = texufile[1];
                                if (rad.nt > 2) {
                                    var image2 = new Image();
                                    image2.onload = function () {
                                        rad.texture[2] = gl.createTexture();
                                        gl.bindTexture(gl.TEXTURE_2D, rad.texture[2]);
                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
                                        if (isPowerOf2(image2.width) && isPowerOf2(image2.height)) {
                                            gl.generateMipmap(gl.TEXTURE_2D);
                                        } else {
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                        }
                                        rad.loaded++;
                                    };
                                    image2.src = texufile[2];
                                }
                                if (rad.nt > 3) {
                                    var image3 = new Image();
                                    image3.onload = function () {
                                        rad.texture[3] = gl.createTexture();
                                        gl.bindTexture(gl.TEXTURE_2D, rad.texture[3]);
                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
                                        if (isPowerOf2(image3.width) && isPowerOf2(image3.height)) {
                                            gl.generateMipmap(gl.TEXTURE_2D);
                                        } else {
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                        }
                                        rad.loaded++;
                                    };
                                    image3.src = texufile[3];
                                }
                                if (rad.nt > 4) {
                                    var image4 = new Image();
                                    image4.onload = function () {
                                        rad.texture[4] = gl.createTexture();
                                        gl.bindTexture(gl.TEXTURE_2D, rad.texture[4]);
                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4);
                                        if (isPowerOf2(image4.width) && isPowerOf2(image4.height)) {
                                            gl.generateMipmap(gl.TEXTURE_2D);
                                        } else {
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                        }
                                        rad.loaded++;
                                    };
                                    image4.src = texufile[4];
                                }
                                if (rad.nt > 5) {
                                    var image5 = new Image();
                                    image5.onload = function () {
                                        rad.texture[5] = gl.createTexture();
                                        gl.bindTexture(gl.TEXTURE_2D, rad.texture[5]);
                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image5);
                                        if (isPowerOf2(image5.width) && isPowerOf2(image5.height)) {
                                            gl.generateMipmap(gl.TEXTURE_2D);
                                        } else {
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                        }
                                        rad.loaded++;
                                    };
                                    image5.src = texufile[5];
                                }
                            }
                        } else {
                            rad.loaded++;
                        }
                    } else {
                        rad.loaded++;
                    }
                } else {
                    rad.loaded = 1;
                }
            }
        }
    };
    rawFile.send(null);
}
function texturegroup() {
    return {
        loaded: 0,
        texture: null
    };
}
function loadtgroup(tgrp, n) {
    tgrp.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tgrp.texture);
    var pixel = new Uint8Array([150, 150, 150, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    var image = new Image();
    image.onload = function () {
        tgrp.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tgrp.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        tgrp.loaded = 1;
    };
    image.src = "data/3D/textures/g" + n + ".png";
}
function cartextures() {
    for (var i = 0; i < 19; i++) {
        carobj[i].nt = 2;
        carobj[i].texture = [];
        carobj[i].texture[0] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, carobj[i].texture[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cartexture[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, carobj[i].texture[0], 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
            var pixels = new Uint8Array((256 * 256 * 4));
            gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            for (var p = 0; p < (256 * 256 * 4); p += 4) {
                if ((pixels[p] == 116) && (pixels[p + 1] == 130) && (pixels[p + 2] == 140)) {
                    pixels[p] = 92;
                    pixels[p + 1] = 155;
                    pixels[p + 2] = 184;
                    pixels[p + 3] = 200;
                }
            }
            gl.bindTexture(gl.TEXTURE_2D, carobj[i].texture[0]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.deleteFramebuffer(framebuffer);
    }
}
function gamecartextures() {
    for (var c = 0; c < ncars; c++) {
        if (carobj[car[c].typ].loaded == 4) {
            gl.deleteTexture(carobj[car[c].typ].texture[1]);
            carobj[car[c].typ].texture[1] = null;
        }
        carobj[car[c].typ].texture[1] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, carobj[car[c].typ].texture[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cartexture[car[c].typ]);
        gl.generateMipmap(gl.TEXTURE_2D);
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, carobj[car[c].typ].texture[1], 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
            var pixels = new Uint8Array((256 * 256 * 4));
            gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            for (var p = 0; p < (256 * 256 * 4); p += 4) {
                if ((pixels[p] == 116) && (pixels[p + 1] == 130) && (pixels[p + 2] == 140)) {
                    pixels[p] = skyglass[0];
                    pixels[p + 1] = skyglass[1];
                    pixels[p + 2] = skyglass[2];
                    pixels[p + 3] = 210;
                }
            }
            gl.bindTexture(gl.TEXTURE_2D, carobj[car[c].typ].texture[1]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        gl.deleteFramebuffer(framebuffer);
        carobj[car[c].typ].ont = 1;
        carobj[car[c].typ].loaded = 4;
    }
}
function groundtexture(n, r, g, b, huef, satf) {
    if (ground.loaded == 4) {
        gl.deleteTexture(ground.texture);
        ground.texture = null;
        for (var i = 6; i < 9; i++) {
            for (var j = 0; j < 5; j++) {
                gl.deleteTexture(dtexture[i][j]);
                dtexture[i][j] = null;
            }
        }
    }
    if (n == -1) {
        n = 0;
    }
    if (huef == -1) {
        huef = 0;
    }
    if (satf == -1) {
        satf = 0;
    }
    var hsl = rgbToHsl(r, g, b);
    ground.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ground.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grndimg[n]);
    gl.generateMipmap(gl.TEXTURE_2D);
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ground.texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        var pixels = new Uint8Array((256 * 256 * 4));
        gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        for (var p = 0; p < (256 * 256 * 4); p += 4) {
            var hue = (hsl[0] + ((1 - (pixels[p] / 188)) * huef));
            if (hue > 1) {
                hue -= 1;
            }
            if (hue < 0) {
                hue += 1;
            }
            var sat = (hsl[1] + ((1 - (pixels[p] / 188)) * satf));
            if (sat > 1) {
                sat = 1;
            }
            if (sat < 0) {
                sat = 0;
            }
            var bri = (hsl[2] * (pixels[p] / 192));
            if (bri > 1) {
                bri = 1;
            }
            if (bri < 0) {
                bri = 0;
            }
            var rgb = hslToRgb(hue, sat, bri);
            pixels[p] = rgb[0];
            pixels[p + 1] = rgb[1];
            pixels[p + 2] = rgb[2];
        }
        gl.bindTexture(gl.TEXTURE_2D, ground.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.deleteFramebuffer(framebuffer);
    hsl[2] *= 1.2;
    if (hsl[2] > 1) {
        hsl[2] = 1;
    }
    var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    for (var i = 6; i < 9; i++) {
        dtexture[i] = [];
        for (var j = 0; j < 5; j++) {
            dtexture[i][j] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, dtexture[i][j]);
            var ui = (i - 6);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spritexture[ui]);
            gl.generateMipmap(gl.TEXTURE_2D);
            var framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dtexture[i][j], 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                var pixels = new Uint8Array((64 * 64 * 4));
                gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                for (var p = 0; p < (64 * 64 * 4); p += 4) {
                    pixels[p] = rgb[0];
                    pixels[p + 1] = rgb[1];
                    pixels[p + 2] = rgb[2];
                    pixels[p + 3] *= (0.75 - (j * 0.15));
                }
                gl.bindTexture(gl.TEXTURE_2D, dtexture[i][j]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.deleteFramebuffer(framebuffer);
        }
    }
    ground.loaded = 4;
}
function skytexture(skyc, fogc, cloudsc, cloudtyp) {
    if (skydom.loaded == 4) {
        gl.deleteTexture(skydom.texture);
        skydom.texture = null;
    }
    var tempt = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tempt);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, haloimg);
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tempt, 0);
    var hpixels = new Uint8Array((256 * 256 * 4));
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, hpixels);
    }
    gl.deleteFramebuffer(framebuffer);
    gl.deleteTexture(tempt);
    skydom.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, skydom.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyimg[cloudtyp]);
    gl.generateMipmap(gl.TEXTURE_2D);
    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, skydom.texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        var pixels = new Uint8Array((256 * 256 * 4));
        gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        for (var p = 0; p < (256 * 256 * 4); p += 4) {
            var hfact = (hpixels[p] / 510);
            var fact = ((pixels[p] / 128) - (hfact * 2));
            if (fact > 1) {
                fact = 1;
            }
            if (fact < 0) {
                fact = 0;
            }
            pixels[p] = ((((skyc[0] * (1 - fact)) + (cloudsc[0] * fact)) * (1 - hfact)) + (fogc[0] * hfact));
            pixels[p + 1] = ((((skyc[1] * (1 - fact)) + (cloudsc[1] * fact)) * (1 - hfact)) + (fogc[1] * hfact));
            pixels[p + 2] = ((((skyc[2] * (1 - fact)) + (cloudsc[2] * fact)) * (1 - hfact)) + (fogc[2] * hfact));
        }
        gl.bindTexture(gl.TEXTURE_2D, skydom.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.deleteFramebuffer(framebuffer);
    skydom.loaded = 4;
}
var dtexture = [];
var stexture = [];
function creatdustextures() {
    for (var i = 0; i < 6; i++) {
        dtexture[i] = [];
        for (var j = 0; j < 5; j++) {
            dtexture[i][j] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, dtexture[i][j]);
            var ui = i;
            if (i >= 3) {
                ui = (i - 3);
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spritexture[ui]);
            gl.generateMipmap(gl.TEXTURE_2D);
            var framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dtexture[i][j], 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                var pixels = new Uint8Array((64 * 64 * 4));
                gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                for (var p = 0; p < (64 * 64 * 4); p += 4) {
                    if (i < 3) {
                        pixels[p] = 192;
                        pixels[p + 1] = 192;
                        pixels[p + 2] = 192;
                        pixels[p + 3] *= (0.5 - (j * 0.1));
                    } else {
                        pixels[p] = 228;
                        pixels[p + 1] = 217;
                        pixels[p + 2] = 192;
                        pixels[p + 3] *= ((5 - j) / 5);
                    }
                }
                gl.bindTexture(gl.TEXTURE_2D, dtexture[i][j]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.deleteFramebuffer(framebuffer);
        }
    }
    for (var i = 0; i < 3; i++) {
        stexture[i] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, stexture[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spritexture[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, stexture[i], 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
            var pixels = new Uint8Array((64 * 64 * 4));
            gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            for (var p = 0; p < (64 * 64 * 4); p += 4) {
                pixels[p] = 65;
                pixels[p + 1] = 186;
                pixels[p + 2] = 255;
                pixels[p + 3] *= 0.5;
            }
            gl.bindTexture(gl.TEXTURE_2D, stexture[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.deleteFramebuffer(framebuffer);
    }
}
var tired = [];
var tiren = [];
var tirel = [];
for (var i = 0; i < 19; i++) {
    tired[i] = [];
    tiren[i] = [];
    tirel[i] = [];
    for (var k = 0; k < 2; k++) {
        tired[i][k] = newrad3D();
        tiren[i][k] = newparticle();
        tirel[i][k] = newparticle();
    }
}
function wheel() {
    return {
        x: 0,
        y: 0,
        z: 0,
        mat: null,
        dist: 0
    };
}
var whl = [];
for (var i = 0; i < 19; i++) {
    whl[i] = [];
    for (var k = 0; k < 4; k++) {
        whl[i][k] = wheel();
    }
}
var wlx = [[5.7, 5.7], [4.28, 5.1], [6.5, 6.5], [6.9, 6.9], [5, 5], [6, 6], [5.7, 5.7], [4, 4.6], [6, 6], [6.1, 6.1], [6, 6], [5.916, 5.916], [6, 6], [5.5, 5.5], [9.2, 9.2], [6.8, 6.8], [8.4, 6.2], [5.9, 5.9], [6.6, 6.6]];
var wly = [[1.845, 1.845], [-1.36, -1.635], [1.13, 1.14], [0.51, 0.51], [1.52, 1.52], [0.882, 0.882], [3.06, 3.06], [1.9, 0.6], [2.88, 2.88], [4.59, 4.59], [-1.099, -1.099], [2.04, 2.04], [2.2, 2.2], [0.278, 0.278], [9.12, 9.12], [3.2, 3.2], [10.03, 10.03], [0.32, 0.32], [0, 0]];
var wlz = [[5.535, -14.76], [11.39, -11.9], [14.25, -7.22], [9.86, -12.58], [7.79, -7.79], [7.35, -13.524], [18.36, -8.16], [9.9, -5.1], [15.12, -7.2], [7.65, -15.147], [10.048, -9.42], [10.08, -11.34], [10.2, -8.5], [8.896, -11.954], [15.2, -18.43], [10.72, -10.72], [19.47, -7.08], [11.52, -13.44], [9.1, -12.922]];
var wlh = [[1.8, 1.8], [1.4, 1.6], [2.1, 2.1], [1.67, 1.67], [1.6, 1.6], [1.85, 1.85], [2.1, 2.1], [2.62, 3.55], [2.1, 2.1], [2.4, 2.4], [2, 2], [2, 2], [2, 2], [1.8, 1.8], [3, 3], [2, 2], [4.2, 4.2], [1.8, 1.8], [3.5, 3.5]];
function createwheels() {
    var wlw = [[1.8, 1.8], [2.2, 2.5], [2.2, 2.2], [1.9, 1.9], [2, 2], [1.9, 1.9], [2, 2], [2.9, 4], [1.8, 1.8], [2.1, 2.1], [2.1, 2.1], [2, 2], [2.5, 2.5], [1.8, 1.8], [3.2, 3.2], [2.3, 2.3], [5, 5], [2, 2], [4.4, 4.4]];
    var rmd = [[-0.15, -0.15], [0.6, 0.6], [-0.1, -0.1], [0.3, 0.3], [0.1, 0.1], [-0.1, -0.1], [0.7, 0.7], [1.1, 1.1], [0.9, 0.9], [-0.5, -0.5], [0.8, 0.8], [0.6, 0.6], [-3, -3], [0.5, 0.5], [1, 1], [0.8, 0.8], [1.3, 1.3], [0.8, 0.8], [0.4, 0.4]];
    for (var c = 0; c < 19; c++) {
        for (var k = 0; k < 2; k++) {
            tired[c][k].ni = (tiredisk.tri.length / 3);
            var indice = [];
            var vert = [];
            var norm = [];
            var texu = [];
            for (var i = 0; i < tired[c][k].ni; i++) {
                indice[i] = i;
                vert[(i * 3)] = (tiredisk.vrt[(tiredisk.tri[(i * 3)] * 3)] * wlh[c][k] * 1.05);
                vert[((i * 3) + 1)] = (tiredisk.vrt[((tiredisk.tri[(i * 3)] * 3) + 1)] * wlh[c][k] * 1.05);
                vert[((i * 3) + 2)] = (tiredisk.vrt[((tiredisk.tri[(i * 3)] * 3) + 2)] * wlw[c][k] * 1.1);
                if (tiredisk.tri[(i * 3)] == 12) {
                    vert[((i * 3) + 2)] += rmd[c][k];
                }
                var tcrad = Math.sqrt((vert[(i * 3)] * vert[(i * 3)]) + (vert[((i * 3) + 1)] * vert[((i * 3) + 1)]) + (vert[((i * 3) + 2)] * vert[((i * 3) + 2)]));
                if (tcrad > tired[c][k].colrad) {
                    tired[c][k].colrad = tcrad;
                }
                norm[(i * 3)] = tiredisk.nrm[(tiredisk.tri[((i * 3) + 1)] * 3)];
                norm[((i * 3) + 1)] = tiredisk.nrm[((tiredisk.tri[((i * 3) + 1)] * 3) + 1)];
                norm[((i * 3) + 2)] = tiredisk.nrm[((tiredisk.tri[((i * 3) + 1)] * 3) + 2)];
                texu[(i * 2)] = tiredisk.tex[(tiredisk.tri[((i * 3) + 2)] * 2)];
                texu[((i * 2) + 1)] = (1 - tiredisk.tex[((tiredisk.tri[((i * 3) + 2)] * 2) + 1)]);
            }
            tired[c][k].vbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tired[c][k].vbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
            tired[c][k].nbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tired[c][k].nbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);
            tired[c][k].tbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tired[c][k].tbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texu), gl.STATIC_DRAW);
            tired[c][k].ibuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tired[c][k].ibuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice), gl.STATIC_DRAW);
            tired[c][k].nt = 1;
            tired[c][k].mat = mat4.create();
            tired[c][k].alpha = 1;
            tired[c][k].texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tired[c][k].texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tireimg[c]);
            if (isPowerOf2(tireimg[0].width) && isPowerOf2(tireimg[0].height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            tired[c][k].loaded = 1;
            tiren[c][k].ni = tire.indice.length;
            var vert = [];
            var norm = [];
            var col = [];
            for (var i = 0; i < (tire.vert.length / 3); i++) {
                vert[(i * 3)] = (tire.vert[(i * 3)] * 1.1 * wlh[c][k]);
                vert[((i * 3) + 1)] = (tire.vert[((i * 3) + 1)] * 1.1 * wlh[c][k]);
                vert[((i * 3) + 2)] = (tire.vert[((i * 3) + 2)] * 1.1 * wlw[c][k]);
                norm[(i * 3)] = -1;
                norm[((i * 3) + 1)] = 0;
                norm[((i * 3) + 2)] = 0;
                col[(i * 4)] = 0.02;
                col[((i * 4) + 1)] = 0.02;
                col[((i * 4) + 2)] = 0.02;
                col[((i * 4) + 3)] = 1
            }
            tiren[c][k].vbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tiren[c][k].vbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
            tiren[c][k].nbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tiren[c][k].nbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);
            tiren[c][k].cbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tiren[c][k].cbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
            tiren[c][k].ibuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tiren[c][k].ibuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tire.indice), gl.STATIC_DRAW);
            tiren[c][k].mat = mat4.create();
            tiren[c][k].loaded = 1;
            tirel[c][k].ni = tirelow.indice.length;
            var vert = [];
            var col = [];
            for (var i = 0; i < (tirelow.vert.length / 3); i++) {
                vert[(i * 3)] = (tirelow.vert[(i * 3)] * 1.1 * wlh[c][k]);
                vert[((i * 3) + 1)] = (tirelow.vert[((i * 3) + 1)] * 1.1 * wlh[c][k]);
                vert[((i * 3) + 2)] = (tirelow.vert[((i * 3) + 2)] * 1.1 * wlw[c][k]);
                col[(i * 4)] = 0.02;
                col[((i * 4) + 1)] = 0.02;
                col[((i * 4) + 2)] = 0.02;
                col[((i * 4) + 3)] = 1;
            }
            tirel[c][k].vbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tirel[c][k].vbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
            tirel[c][k].cbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tirel[c][k].cbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
            tirel[c][k].ibuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tirel[c][k].ibuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tirelow.indice), gl.STATIC_DRAW);
            tirel[c][k].mat = mat4.create();
            tirel[c][k].loaded = 1;
        }
    }
}
function setwheelspos() {
    for (var c = 0; c < ncars; c++) {
        var cn = car[c].typ;
        whl[cn][0].x = (car[c].x - (wlx[cn][0] * car[c].mat[0]) - (wly[cn][0] * car[c].mat[4]) + (wlz[cn][0] * car[c].mat[8]));
        whl[cn][0].y = (car[c].y - (wlx[cn][0] * car[c].mat[1]) - (wly[cn][0] * car[c].mat[5]) + (wlz[cn][0] * car[c].mat[9]));
        whl[cn][0].z = (car[c].z - (wlx[cn][0] * car[c].mat[2]) - (wly[cn][0] * car[c].mat[6]) + (wlz[cn][0] * car[c].mat[10]));
        whl[cn][0].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[cn][0].mat[k] = car[c].mat[k];
        }
        mat4.rotate(whl[cn][0].mat, whl[cn][0].mat, ((90 - car[c].wxz) * (Math.PI / 180)), [0, 1, 0]);
        mat4.rotate(whl[cn][0].mat, whl[cn][0].mat, (car[c].wzy * (Math.PI / 180)), [0, 0, -1]);
        whl[cn][1].x = (car[c].x + (wlx[cn][0] * car[c].mat[0]) - (wly[cn][0] * car[c].mat[4]) + (wlz[cn][0] * car[c].mat[8]));
        whl[cn][1].y = (car[c].y + (wlx[cn][0] * car[c].mat[1]) - (wly[cn][0] * car[c].mat[5]) + (wlz[cn][0] * car[c].mat[9]));
        whl[cn][1].z = (car[c].z + (wlx[cn][0] * car[c].mat[2]) - (wly[cn][0] * car[c].mat[6]) + (wlz[cn][0] * car[c].mat[10]));
        whl[cn][1].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[cn][1].mat[k] = car[c].mat[k];
        }
        mat4.rotate(whl[cn][1].mat, whl[cn][1].mat, ((-90 - car[c].wxz) * (Math.PI / 180)), [0, 1, 0]);
        mat4.rotate(whl[cn][1].mat, whl[cn][1].mat, (car[c].wzy * (Math.PI / 180)), [0, 0, 1]);
        whl[cn][2].x = (car[c].x - (wlx[cn][1] * car[c].mat[0]) - (wly[cn][1] * car[c].mat[4]) + (wlz[cn][1] * car[c].mat[8]));
        whl[cn][2].y = (car[c].y - (wlx[cn][1] * car[c].mat[1]) - (wly[cn][1] * car[c].mat[5]) + (wlz[cn][1] * car[c].mat[9]));
        whl[cn][2].z = (car[c].z - (wlx[cn][1] * car[c].mat[2]) - (wly[cn][1] * car[c].mat[6]) + (wlz[cn][1] * car[c].mat[10]));
        whl[cn][2].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[cn][2].mat[k] = car[c].mat[k];
        }
        mat4.rotate(whl[cn][2].mat, whl[cn][2].mat, (90 * (Math.PI / 180)), [0, 1, 0]);
        mat4.rotate(whl[cn][2].mat, whl[cn][2].mat, (car[c].wzy * (Math.PI / 180)), [0, 0, -1]);
        whl[cn][3].x = (car[c].x + (wlx[cn][1] * car[c].mat[0]) - (wly[cn][1] * car[c].mat[4]) + (wlz[cn][1] * car[c].mat[8]));
        whl[cn][3].y = (car[c].y + (wlx[cn][1] * car[c].mat[1]) - (wly[cn][1] * car[c].mat[5]) + (wlz[cn][1] * car[c].mat[9]));
        whl[cn][3].z = (car[c].z + (wlx[cn][1] * car[c].mat[2]) - (wly[cn][1] * car[c].mat[6]) + (wlz[cn][1] * car[c].mat[10]));
        whl[cn][3].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[cn][3].mat[k] = car[c].mat[k];
        }
        mat4.rotate(whl[cn][3].mat, whl[cn][3].mat, (-90 * (Math.PI / 180)), [0, 1, 0]);
        mat4.rotate(whl[cn][3].mat, whl[cn][3].mat, (car[c].wzy * (Math.PI / 180)), [0, 0, 1]);
        for (var j = 0; j < 4; j++) {
            whl[cn][j].dist = pyd(whl[cn][j].x, camx, whl[cn][j].y, camy, whl[cn][j].z, camz);
        }
    }
}
var shadadj = [6.5, -2, -4, 0, 0, 2.5, -6.9, -7, -2.5, 3.5, -1.5, 1, -0.5, 2.5, 1, -1, -10, 1.1, 2.8];
function shadoworks() {
    for (var c = 0; c < ncars; c++) {
        var cat = 0.5;
        if (Math.abs(car[c].mat[9]) > Math.abs(car[c].mat[1])) {
            cat = 0.4;
        }
        if (Math.abs(car[c].mat[5]) < cat) {
            if (Math.abs(car[c].mat[9]) > Math.abs(car[c].mat[1])) {
                shad[car[c].typ].x = car[c].x;
                shad[car[c].typ].z = car[c].z;
                shad[car[c].typ].ont = 2;
                shad[car[c].typ].mat[0] = car[c].mat[0];
                shad[car[c].typ].mat[2] = car[c].mat[2];
                shad[car[c].typ].mat[4] = car[c].mat[8];
                shad[car[c].typ].mat[6] = car[c].mat[10];
                shad[car[c].typ].mat[8] = -car[c].mat[4];
                shad[car[c].typ].mat[10] = -car[c].mat[6];
            } else {
                shad[car[c].typ].x = (car[c].x - (shadadj[car[c].typ] * car[c].mat[8]));
                shad[car[c].typ].z = (car[c].z - (shadadj[car[c].typ] * car[c].mat[10]));
                shad[car[c].typ].ont = 1;
                shad[car[c].typ].mat[0] = car[c].mat[8];
                shad[car[c].typ].mat[2] = car[c].mat[10];
                shad[car[c].typ].mat[4] = car[c].mat[0];
                shad[car[c].typ].mat[6] = car[c].mat[2];
                shad[car[c].typ].mat[8] = -car[c].mat[4];
                shad[car[c].typ].mat[10] = -car[c].mat[6];
            }
        } else {
            shad[car[c].typ].x = (car[c].x - (shadadj[car[c].typ] * car[c].mat[8]));
            shad[car[c].typ].z = (car[c].z - (shadadj[car[c].typ] * car[c].mat[10]));
            shad[car[c].typ].ont = 0;
            shad[car[c].typ].mat[0] = car[c].mat[8];
            shad[car[c].typ].mat[2] = car[c].mat[10];
            shad[car[c].typ].mat[4] = car[c].mat[4];
            shad[car[c].typ].mat[6] = car[c].mat[6];
            shad[car[c].typ].mat[8] = car[c].mat[0];
            shad[car[c].typ].mat[10] = car[c].mat[2];
        }
        shad[car[c].typ].intershad = false;
        shad[car[c].typ].y = 0.4;
        shad[car[c].typ].mat[1] = 0;
        shad[car[c].typ].mat[5] = 1;
        shad[car[c].typ].mat[9] = 0;
        for (var i = 0; i < nb; i++) {
            if (build[obo[i].typ].intershad) {
                build[obo[i].typ].x = obo[i].x;
                build[obo[i].typ].y = obo[i].y;
                build[obo[i].typ].z = obo[i].z;
                build[obo[i].typ].mat = obo[i].mat;
                shadowmap(car[c], shad[car[c].typ], build[obo[i].typ]);
            }
        }
    }
}
function shadowmap(crft, shd, rad) {
    if ((Math.abs(crft.x - rad.x) < (carobj[crft.typ].colrad + rad.colrad)) && (Math.abs(crft.z - rad.z) < (carobj[crft.typ].colrad + rad.colrad))) {
        var snormx = 0;
        var snormy = 0;
        var snormz = 0;
        for (var i = 0; i < (rad.ni / 3); i++) {
            var vertx = [];
            var verty = [];
            var vertz = [];
            for (var v = 0; v < 3; v++) {
                var vp = rad.tri[((i * 9) + (v * 3))];
                vertx[v] = ( - (rad.vrt[(vp * 3)] * rad.mat[0]) + (rad.vrt[((vp * 3) + 2)] * rad.mat[8]));
                verty[v] = rad.vrt[((vp * 3) + 1)];
                vertz[v] = ((rad.vrt[((vp * 3) + 2)] * rad.mat[10]) - (rad.vrt[(vp * 3)] * rad.mat[2]));
            }
            var areaOrig = Math.abs(((vertx[1] - vertx[0]) * (vertz[2] - vertz[0])) - ((vertx[2] - vertx[0]) * (vertz[1] - vertz[0])));
            var px = (shd.x - rad.x);
            var pz = (shd.z - rad.z);
            var area1 = Math.abs(((vertx[0] - px) * (vertz[1] - pz)) - ((vertx[1] - px) * (vertz[0] - pz)));
            var area2 = Math.abs(((vertx[1] - px) * (vertz[2] - pz)) - ((vertx[2] - px) * (vertz[1] - pz)));
            var area3 = Math.abs(((vertx[2] - px) * (vertz[0] - pz)) - ((vertx[0] - px) * (vertz[2] - pz)));
            if ((area1 + area2 + area3) <= (areaOrig + 10)) {
                var vp = rad.tri[((i * 9) + 1)];
                if (rad.nrm[((vp * 3) + 1)] > 0.06) {
                    var fct = 0;
                    if ((vertz[0] - vertz[1]) != 0) {
                        fct = ((shd.z - (vertz[1] + rad.z)) / (vertz[0] - vertz[1]));
                    } else {
                        fct = 0;
                    }
                    var lx = (vertx[1] + ((vertx[0] - vertx[1]) * fct));
                    var ly = (verty[1] + ((verty[0] - verty[1]) * fct));
                    if ((vertz[0] - vertz[2]) != 0) {
                        fct = ((shd.z - (vertz[2] + rad.z)) / (vertz[0] - vertz[2]));
                    } else {
                        fct = 0;
                    }
                    var tx = (vertx[2] + ((vertx[0] - vertx[2]) * fct));
                    var ty = (verty[2] + ((verty[0] - verty[2]) * fct));
                    if ((tx - lx) != 0) {
                        fct = ((shd.x - (lx + rad.x)) / (tx - lx));
                    } else {
                        fct = 0;
                    }
                    var shdy = (ly + ((ty - ly) * fct));
                    if ((shdy < crft.y) && (shdy > (shd.y - 0.5))) {
                        snormx = ( - (rad.nrm[(vp * 3)] * rad.mat[0]) + (rad.nrm[((vp * 3) + 2)] * rad.mat[8]));
                        snormy = rad.nrm[((vp * 3) + 1)];
                        snormz = ((rad.nrm[((vp * 3) + 2)] * rad.mat[10]) - (rad.nrm[(vp * 3)] * rad.mat[2]));
                        if (Math.abs(snormy) > 0.1) {
                            var diz = -1;
                            if (shd.ont == 0) {
                                if (crft.mat[5] < 0) {
                                    diz = 1;
                                }
                            }
                            if (shd.ont == 1) {
                                if (crft.mat[1] < 0) {
                                    diz = 1;
                                }
                            }
                            if (shd.ont == 2) {
                                if (crft.mat[9] > 0) {
                                    diz = 1;
                                }
                            }
                            shd.mat[1] = ( - (snormx * shd.mat[0]) + (diz * snormz * shd.mat[8]));
                            shd.mat[5] = snormy;
                            shd.mat[9] = ( - (snormz * shd.mat[10]) + (diz * snormx * shd.mat[2]));
                            shd.y = shdy;
                            shd.intershad = true;
                        }
                    }
                }
            }
        }
    }
}
var spark = [];
for (var s = 0; s < 6; s++) {
    spark[s] = newparticle();
}
function createsparks() {
    var neg = 1;
    for (var s = 0; s < 6; s++) {
        if (spark[s].loaded == 1) {
            gl.deleteBuffer(spark[s].vbuf);
            spark[s].vbuf = null;
            gl.deleteBuffer(spark[s].cbuf);
            spark[s].cbuf = null;
            gl.deleteBuffer(spark[s].ibuf);
            spark[s].ibuf = null;
        }
        var vert = [];
        var indice = [];
        var von = (Math.random() * 1);
        var negvon = 1;
        if (Math.random() > Math.random()) {
            negvon = -1;
        }
        var varn = (20 + (Math.random() * 10));
        var size = (0.2 + (s * 0.04));
        var ox = [(-0.5 * size), (0.5 * size), 0];
        var oy = [(0.5 * neg * size), (-0.5 * neg * size), 0];
        var oz = [(von * negvon * size), (-von * negvon * size), -varn];
        if (neg == 1) {
            neg = -1;
        } else {
            neg = 1;
        }
        for (var i = 0; i < 3; i++) {
            indice[i] = i;
            vert[(i * 3)] = ox[i];
            vert[((i * 3) + 1)] = oy[i];
            vert[((i * 3) + 2)] = oz[i];
        }
        var col = [(1 + (1 * snap[0])), (0.77 + (0.77 * snap[1])), 0, 1, (1 + (1 * snap[0])), (0.77 + (0.77 * snap[1])), 0, 1, (1 + (1 * snap[0])), 0, 0, 0.4];
        spark[s].ni = 3;
        spark[s].vbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, spark[s].vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
        spark[s].cbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, spark[s].cbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
        spark[s].ibuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spark[s].ibuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice), gl.STATIC_DRAW);
        spark[s].alpha = true;
        spark[s].mat = mat4.create();
        spark[s].x = (s * 10);
        spark[s].y = 5;
        spark[s].loaded = 1;
    }
}
function colorcptext() {
    gl.deleteBuffer(cptext.cbuf);
    cptext.cbuf = null;
    var cupr = [62, 160, 252, 192];
    var cdnr = [211, 234, 255, 192];
    for (var k = 0; k < 3; k++) {
        cupr[i] += (cupr[i] * snap[i]);
        if (cupr[i] < 0) {
            cupr[i] = 0;
        }
        if (cupr[i] > 255) {
            cupr[i] = 255;
        }
        cdnr[i] += (cdnr[i] * snap[i]);
        if (cdnr[i] < 0) {
            cdnr[i] = 0;
        }
        if (cdnr[i] > 255) {
            cdnr[i] = 255;
        }
    }
    var col = [];
    for (var i = 0; i < (cptext.vert.length / 3); i++) {
        if (cptext.vert[((i * 3) + 1)] < 0) {
            for (var k = 0; k < 4; k++) {
                col[((i * 4) + k)] = (cupr[k] / 255);
            }
        } else {
            for (var k = 0; k < 4; k++) {
                col[((i * 4) + k)] = (cdnr[k] / 255);
            }
        }
    }
    cptext.cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cptext.cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
}
function colorbgst() {
    gl.deleteBuffer(bgst.cbuf);
    bgst.cbuf = null;
    var r = Math.floor(128 - (128 * snap[0]));
    if (r > 255) {
        r = 255;
    }
    if (r < 0) {
        r = 0;
    }
    var g = Math.floor(128 - (128 * snap[1]));
    if (g > 255) {
        g = 255;
    }
    if (g < 0) {
        g = 0;
    }
    var b = Math.floor(128 - (128 * snap[2]));
    if (b > 255) {
        b = 255;
    }
    if (b < 0) {
        b = 0;
    }
    var hsl = rgbToHsl(r, g, b);
    var rgb1 = hslToRgb(hsl[0], 1, 0.94);
    rgb1[3] = 255;
    var rgb2 = hslToRgb(hsl[0], 1, 0.7);
    rgb2[3] = 255;
    var col = [];
    for (var i = 0; i < (cptext.vert.length / 3); i++) {
        if (i == 0) {
            for (var k = 0; k < 4; k++) {
                col[((i * 4) + k)] = (rgb1[k] / 255);
            }
        } else {
            for (var k = 0; k < 4; k++) {
                col[((i * 4) + k)] = (rgb2[k] / 255);
            }
        }
    }
    bgst.cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgst.cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
}
function colorbgstforend() {
    gl.deleteBuffer(bgst.cbuf);
    bgst.cbuf = null;
    var r = Math.floor(128 - (128 * snap[0]));
    if (r > 255) {
        r = 255;
    }
    if (r < 0) {
        r = 0;
    }
    var g = Math.floor(128 - (128 * snap[1]));
    if (g > 255) {
        g = 255;
    }
    if (g < 0) {
        g = 0;
    }
    var b = Math.floor(128 - (128 * snap[2]));
    if (b > 255) {
        b = 255;
    }
    if (b < 0) {
        b = 0;
    }
    var hsl = rgbToHsl(r, g, b);
    var rgb1 = hslToRgb(hsl[0], 0.4, 0.15);
    rgb1[3] = 255;
    var rgb2 = hslToRgb(hsl[0], 0.4, 0.1);
    rgb2[3] = 255;
    var col = [];
    for (var i = 0; i < (cptext.vert.length / 3); i++) {
        if (i == 0) {
            for (var k = 0; k < 4; k++) {
                col[((i * 4) + k)] = (rgb1[k] / 255);
            }
        } else {
            for (var k = 0; k < 4; k++) {
                col[((i * 4) + k)] = (rgb2[k] / 255);
            }
        }
    }
    bgst.cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgst.cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
}
function drawparticle(rad) {
    if (rad.loaded) {
        if (rad.alpha) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        rad.mat[12] = (rad.x - camx);
        rad.mat[13] = (rad.y - camy);
        rad.mat[14] = (rad.z - camz);
        gl.bindBuffer(gl.ARRAY_BUFFER, rad.vbuf);
        gl.vertexAttribPointer(programInfo[0].attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo[0].attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, rad.cbuf);
        gl.vertexAttribPointer(programInfo[0].attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo[0].attribLocations.vertexColor);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rad.ibuf);
        gl.useProgram(programInfo[0].program);
        gl.uniformMatrix4fv(programInfo[0].uniformLocations.projectionMatrix, false, cmat);
        gl.uniformMatrix4fv(programInfo[0].uniformLocations.modelViewMatrix, false, rad.mat);
        gl.drawElements(gl.TRIANGLES, rad.ni, gl.UNSIGNED_SHORT, 0);
        if (rad.alpha) {
            gl.disable(gl.BLEND);
        }
    }
}
function drawrad3D(rad) {
    if (rad.loaded) {
        if (rad.alpha) {
            gl.enable(gl.BLEND);
            if (rad.alpha == 1) {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
            if (rad.alpha == 2) {
                gl.blendFunc(gl.ONE_MINUS_CONSTANT_COLOR, gl.DST_COLOR);
            }
            if (rad.alpha == 3) {
                gl.blendFunc(gl.ONE_MINUS_CONSTANT_COLOR, gl.DST_ALPHA);
            }
        }
        var pro = 1;
        if (rad.ownshade) {
            pro = 2;
        }
        if (rad.ownlight) {
            pro = 3;
            if (rad.ownshade) {
                pro = 4;
            }
        }
        rad.mat[12] = (rad.x - camx);
        rad.mat[13] = (rad.y - camy);
        rad.mat[14] = (rad.z - camz);
        var normalMatrix = null;
        if (pro == 1) {
            normalMatrix = mat4.create();
            mat4.invert(normalMatrix, rad.mat);
            mat4.transpose(normalMatrix, normalMatrix);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, rad.vbuf);
        gl.vertexAttribPointer(programInfo[pro].attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo[pro].attribLocations.vertexPosition);
        if (pro == 1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, rad.nbuf);
            gl.vertexAttribPointer(programInfo[pro].attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo[pro].attribLocations.vertexNormal);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, rad.tbuf);
        gl.vertexAttribPointer(programInfo[pro].attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo[pro].attribLocations.textureCoord);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rad.ibuf);
        gl.useProgram(programInfo[pro].program);
        gl.uniformMatrix4fv(programInfo[pro].uniformLocations.projectionMatrix, false, cmat);
        gl.uniformMatrix4fv(programInfo[pro].uniformLocations.modelViewMatrix, false, rad.mat);
        if (pro == 1) {
            gl.uniformMatrix4fv(programInfo[pro].uniformLocations.normalMatrix, false, normalMatrix);
        }
        gl.activeTexture(gl.TEXTURE0);
        if (!rad.tgn) {
            if (rad.nt == 1) {
                gl.bindTexture(gl.TEXTURE_2D, rad.texture);
            } else {
                gl.bindTexture(gl.TEXTURE_2D, rad.texture[rad.ont]);
            }
        } else {
            gl.bindTexture(gl.TEXTURE_2D, tgroup[(rad.tgn - 1)].texture);
        }
        gl.uniform1i(programInfo[pro].uniformLocations.uSampler, 0);
        gl.drawElements(gl.TRIANGLES, rad.ni, gl.UNSIGNED_SHORT, 0);
        if (rad.alpha) {
            gl.disable(gl.BLEND);
        }
    }
}
function setworld(snap, fogc, ldx, ldy, ldz, fogdist) {
    var ambcol = [];
    var defcol = [];
    var owncol = [];
    var litcol = [];
    var fogcol = [];
    for (var i = 0; i < 3; i++) {
        ambcol[i] = (0.6 + (snap[i] * 0.6));
        ambcol[i] *= 0.76;
        defcol[i] = (0.7 + (snap[i] * 0.7));
        defcol[i] *= 0.76;
        owncol[i] = (1.2 + (snap[i] * 1.2));
        owncol[i] *= 0.76;
        litcol[i] = (1.3 + (snap[i] * 1.3));
        litcol[i] *= 0.76;
        fogcol[i] = (fogc[i] / 255);
        fogcol[i] = (fogcol[i] + (fogcol[i] * snap[i]));
        fogcol[i] *= 0.76;
    }
    var dirvec = [ldx, ldy, ldz];
    var fogstart = 100;
    var fogend = fogdist;
    var vsSource = [];
    var fsSource = [];
    vsSource[0] = `attribute vec4 aVertexPosition; attribute vec4 aVertexColor; uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix; varying lowp vec4 vColor; varying vec3 v_posf; void main(void) { gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; vColor = aVertexColor; v_posf = (uModelViewMatrix * aVertexPosition).xyz; }`;
    fsSource[0] = `precision mediump float; varying vec3 v_posf; varying lowp vec4 vColor; highp vec4 u_fogColor=vec4(` + fogcol[0] + `,` + fogcol[1] + `,` + fogcol[2] + `,1);highp float u_fogNear=` + fogstart + `.0;highp float u_fogFar=` + fogend + `.0; void main(void) { float abx=abs(v_posf.x); float aby=abs(v_posf.y); float abz=abs(v_posf.z); float fct=(abs(abx-abz)/(abx+abz)); float mav=((abx+abz)/(2.0-fct)); float fogDistance=((mav+(mav*(1.0-fct)*0.414))+(aby*0.5)); float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);gl_FragColor = mix(vColor, u_fogColor, fogAmount); }`;
    vsSource[1] = `attribute vec4 aVertexPosition; attribute vec3 aVertexNormal; attribute vec2 aTextureCoord; uniform mat4 uNormalMatrix; uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix; varying highp vec2 vTextureCoord; varying highp vec3 vLighting;varying vec3 v_posf; void main(void) { gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; vTextureCoord = aTextureCoord; highp vec3 ambientLight = vec3(` + ambcol[0] + `,` + ambcol[1] + `,` + ambcol[2] + `); highp vec3 directionalLightColor = vec3(` + defcol[0] + `,` + defcol[1] + `,` + defcol[2] + `); highp vec3 directionalVector = normalize(vec3(` + dirvec[0] + `,` + dirvec[1] + `,` + dirvec[2] + `)); highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0); highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0); vLighting = ambientLight + (directionalLightColor * directional); v_posf = (uModelViewMatrix * aVertexPosition).xyz; }`;
    fsSource[1] = `precision mediump float;varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;uniform sampler2D uSampler; highp vec4 u_fogColor=vec4(` + fogcol[0] + `,` + fogcol[1] + `,` + fogcol[2] + `,1);highp float u_fogNear=` + fogstart + `.0;highp float u_fogFar=` + fogend + `.0; void main(void) { highp vec4 texelColor = texture2D(uSampler, vTextureCoord); float abx=abs(v_posf.x); float aby=abs(v_posf.y); float abz=abs(v_posf.z); float fct=(abs(abx-abz)/(abx+abz)); float mav=((abx+abz)/(2.0-fct)); float fogDistance=((mav+(mav*(1.0-fct)*0.414))+(aby*0.5)); float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);highp vec4 color=vec4(texelColor.rgb * vLighting, texelColor.a); gl_FragColor = mix(color, u_fogColor, fogAmount); }`;
    vsSource[2] = `attribute vec4 aVertexPosition; attribute vec2 aTextureCoord; uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix; varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;void main(void) { gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; vTextureCoord = aTextureCoord; highp vec3 ambientLight=vec3(` + owncol[0] + `,` + owncol[1] + `,` + owncol[2] + `); vLighting = ambientLight; v_posf = (uModelViewMatrix * aVertexPosition).xyz; }`;
    fsSource[2] = `precision mediump float;varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;uniform sampler2D uSampler; highp vec4 u_fogColor=vec4(` + fogcol[0] + `,` + fogcol[1] + `,` + fogcol[2] + `,1);highp float u_fogNear=` + fogstart + `.0;highp float u_fogFar=` + fogend + `.0; void main(void) { highp vec4 texelColor = texture2D(uSampler, vTextureCoord); float abx=abs(v_posf.x); float aby=abs(v_posf.y); float abz=abs(v_posf.z); float fct=(abs(abx-abz)/(abx+abz)); float mav=((abx+abz)/(2.0-fct)); float fogDistance=((mav+(mav*(1.0-fct)*0.414))+(aby*0.5)); float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);highp vec4 color=vec4(texelColor.rgb * vLighting, texelColor.a); gl_FragColor = mix(color, u_fogColor, fogAmount); }`;
    vsSource[3] = `attribute vec4 aVertexPosition; attribute vec2 aTextureCoord; uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix; varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;void main(void) { gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; vTextureCoord = aTextureCoord; highp vec3 ambientLight=vec3(` + litcol[0] + `,` + litcol[1] + `,` + litcol[2] + `); vLighting = ambientLight; v_posf = (uModelViewMatrix * aVertexPosition).xyz; }`;
    fsSource[3] = `precision mediump float;varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;uniform sampler2D uSampler; highp vec4 u_fogColor=vec4(` + fogcol[0] + `,` + fogcol[1] + `,` + fogcol[2] + `,1);highp float u_fogNear=` + fogstart + `.0;highp float u_fogFar=` + fogend + `.0; void main(void) { highp vec4 texelColor = texture2D(uSampler, vTextureCoord); float abx=abs(v_posf.x); float aby=abs(v_posf.y); float abz=abs(v_posf.z); float fct=(abs(abx-abz)/(abx+abz)); float mav=((abx+abz)/(2.0-fct)); float fogDistance=((mav+(mav*(1.0-fct)*0.414))+(aby*0.5)); float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);highp vec4 color=vec4(texelColor.rgb * vLighting, texelColor.a); gl_FragColor = mix(color, u_fogColor, fogAmount); }`;
    vsSource[4] = `attribute vec4 aVertexPosition; attribute vec2 aTextureCoord; uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix; varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;void main(void) { gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; vTextureCoord = aTextureCoord; highp vec3 ambientLight=vec3(1,1,1); vLighting = ambientLight; v_posf = (uModelViewMatrix * aVertexPosition).xyz; }`;
    fsSource[4] = `precision mediump float;varying highp vec2 vTextureCoord; varying highp vec3 vLighting; varying vec3 v_posf;uniform sampler2D uSampler; highp vec4 u_fogColor=vec4(` + fogcol[0] + `,` + fogcol[1] + `,` + fogcol[2] + `,1);highp float u_fogNear=` + fogstart + `.0;highp float u_fogFar=` + fogend + `.0; void main(void) { highp vec4 texelColor = texture2D(uSampler, vTextureCoord); float abx=abs(v_posf.x); float aby=abs(v_posf.y); float abz=abs(v_posf.z); float fct=(abs(abx-abz)/(abx+abz)); float mav=((abx+abz)/(2.0-fct)); float fogDistance=((mav+(mav*(1.0-fct)*0.414))+(aby*0.5)); float fogAmount = smoothstep(u_fogNear, u_fogFar, fogDistance);highp vec4 color=vec4(texelColor.rgb * vLighting, texelColor.a); gl_FragColor = mix(color, u_fogColor, fogAmount); }`;
    var shaderProgram = [];
    for (var i = 0; i < 5; i++) {
        programInfo[i] = null;
        shaderProgram[i] = initShaderProgram(gl, vsSource[i], fsSource[i]);
    }
    programInfo[0] = {
        program: shaderProgram[0],
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram[0], 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram[0], 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram[0], 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram[0], 'uModelViewMatrix'),
        }
    };
    programInfo[1] = {
        program: shaderProgram[1],
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram[1], 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram[1], 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(shaderProgram[1], 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram[1], 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram[1], 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram[1], 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram[1], 'uSampler'),
        }
    };
    programInfo[2] = {
        program: shaderProgram[2],
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram[2], 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram[2], 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram[2], 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram[2], 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram[2], 'uSampler'),
        }
    };
    programInfo[3] = {
        program: shaderProgram[3],
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram[3], 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram[3], 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram[3], 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram[3], 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram[3], 'uSampler'),
        }
    };
    programInfo[4] = {
        program: shaderProgram[4],
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram[4], 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram[4], 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram[4], 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram[4], 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram[4], 'uSampler'),
        }
    };
}
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function isPowerOf2(value) {
    return ((value & (value - 1)) == 0);
}
function getonscreen(m, rad) {
    var x = rad.mat[12];
    var y = rad.mat[13];
    var z = rad.mat[14];
    var w = x * m[0 * 4 + 3] + y * m[1 * 4 + 3] + z * m[2 * 4 + 3] + m[3 * 4 + 3];
    var propoint = [((x * m[0 * 4 + 0] + y * m[1 * 4 + 0] + z * m[2 * 4 + 0] + m[3 * 4 + 0]) / w), ((x * m[0 * 4 + 1] + y * m[1 * 4 + 1] + z * m[2 * 4 + 1] + m[3 * 4 + 1]) / w), ((x * m[0 * 4 + 2] + y * m[1 * 4 + 2] + z * m[2 * 4 + 2] + m[3 * 4 + 2]) / w)];
    return [((propoint[0] * 0.5 + 0.5) * canw), ((propoint[1] * -0.5 + 0.5) * canh)];
}
function getxyzscreen(m, x, y, z) {
    x -= camx;
    y -= camy;
    z -= camz;
    var w = x * m[0 * 4 + 3] + y * m[1 * 4 + 3] + z * m[2 * 4 + 3] + m[3 * 4 + 3];
    var propoint = [((x * m[0 * 4 + 0] + y * m[1 * 4 + 0] + z * m[2 * 4 + 0] + m[3 * 4 + 0]) / w), ((x * m[0 * 4 + 1] + y * m[1 * 4 + 1] + z * m[2 * 4 + 1] + m[3 * 4 + 1]) / w), ((x * m[0 * 4 + 2] + y * m[1 * 4 + 2] + z * m[2 * 4 + 2] + m[3 * 4 + 2]) / w)];
    return [((propoint[0] * 0.5 + 0.5) * canw), ((propoint[1] * -0.5 + 0.5) * canh)];
}
var seed = 0;
function mrandom() {
    var rand = (Math.sin(seed * (Math.PI / 1800)) * 1000);
    seed++;
    if (seed >= 3600) {
        seed = 0;
    }
    rand = (rand - Math.floor(rand));
    return rand;
}
function py(x1, x2, z1, z2) {
    return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((z1 - z2) * (z1 - z2)));
}
function pyd(x1, x2, y1, y2, z1, z2) {
    return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)) + ((z1 - z2) * (z1 - z2)));
}
function strtsWith(line, sval) {
    return (line.substring(0, sval.length) == sval);
}
function getIntValue(func, strn, indx) {
    var ret = -1;
    try {
        var w = 0,
        c = 0,
        got = 0;
        var o = "",
        r = "";
        w = (func.length + 1);
        while ((w < strn.length) && (got != 2)) {
            o = "" + strn.charAt(w);
            if (o == "," || o == ")") {
                c++;
                if (got == 1 || c > indx) {
                    got = 2;
                }
            } else {
                if (c == indx) {
                    r += o;
                    got = 1;
                }
            }
            w++;
        }
        if (r == "") {
            r = "-1";
        }
        ret = parseInt(r);
        var rrc = "" + ret;
        if (rrc == "NaN") {
            ret = -1;
        }
    } catch (err) {
        ret = -1;
    }
    return ret;
}
function getStringValue(func, strn, indx) {
    var ret = "";
    try {
        var w = 0,
        c = 0,
        got = 0;
        var o = "",
        r = "";
        w = (func.length + 1);
        while ((w < strn.length) && (got != 2)) {
            o = "" + strn.charAt(w);
            if (o == "," || o == ")") {
                c++;
                if (got == 1 || c > indx) {
                    got = 2;
                }
            } else {
                if (c == indx) {
                    r += o;
                    got = 1;
                }
            }
            w++;
        }
        ret = r;
    } catch (err) {
        ret = "";
    }
    return ret;
}
function getFloatValue(func, strn, indx) {
    var ret = -1;
    try {
        var w = 0,
        c = 0,
        got = 0;
        var o = "",
        r = "";
        w = (func.length + 1);
        while ((w < strn.length) && (got != 2)) {
            o = "" + strn.charAt(w);
            if (o == "," || o == ")") {
                c++;
                if (got == 1 || c > indx) {
                    got = 2;
                }
            } else {
                if (c == indx) {
                    r += o;
                    got = 1;
                }
            }
            w++;
        }
        if (r == "") {
            r = "-1";
        }
        ret = parseFloat(r);
        var rrc = "" + ret;
        if (rrc == "NaN") {
            ret = -1;
        }
    } catch (err) {
        ret = -1;
    }
    return ret;
}
function hslToRgb(h, s, l) {
    var r,
    g,
    b;
    if (s == 0) {
        r = g = b = l;
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHsl(r, g, b) {
    r /= 255,
    g /= 255,
    b /= 255;
    var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
    var h,
    s,
    l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
    }
    return [h, s, l];
}
var isphone = false;
if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i) || navigator.userAgent.match(/IEMobile/i)) {
    isphone = true;
}
if ("ontouchstart" in document.documentElement) {
    isphone = true;
}
var isios = false;
if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    isios = true;
}
var rdres = 1;
if (screen.width <= 680) {
    rdres = 2;
}
var ground = newrad3D();
var grndimg = [];
var skydom = newrad3D();
var skyimg = [];
var haloimg = null;
var carobj = [];
var shad = [];
for (var i = 0; i < 19; i++) {
    carobj[i] = newrad3D();
    shad[i] = newrad3D();
}
var cartexture = [];
var tireimg = [];
var tiredisk = newrad3D();
var tire = newparticle();
var tirelow = newparticle();
var cptext = newparticle();
var fntext = newparticle();
var bgst = newparticle();
var build = [];
for (var i = 0; i < 66; i++) {
    build[i] = newrad3D();
}
var tgroup = [];
for (var i = 0; i < 20; i++) {
    tgroup[i] = texturegroup();
}
var fixdisk = newrad3D();
var elec = newrad3D();
var sprite = newrad3D();
var spritexture = [];
var explode = [];
for (var i = 0; i < 3; i++) {
    explode[i] = newrad3D();
}
var bg3D = newrad3D();
var rosize = null;
var contimg = [];
var btimg = [];
var muimg = [];
var lbar, rbar, lckd, rewd;
var mainbg, rider, logo;
var insano = [];
var inst = [];
var confeloaded = false;
var confe = [];
function loadconfe() {
    if (!confeloaded) {
        for (var i = 0; i < 29; i++) {
            confe[i] = new Image();
            confe[i].src = "data/interface" + rdres + "/conf/" + i + ".png";
        }
        confeloaded = true;
    }
}
var reqload = false;
var dataload = 0;
var pokiready = false;
var datacnt = 3275;
if (isphone) {
    datacnt = 3243;
}
function loaddata() {
    if (gl) {
        drawloading();
        if (!reqload) {
            loadrad3D("data/3D/ground.r3d", ground);
            for (var i = 0; i < 3; i++) {
                grndimg[i] = new Image();
                grndimg[i].onload = function () {
                    dataload += 17;
                };
                grndimg[i].src = "data/3D/textures/ground" + (i + 1) + ".png";
            }
            loadrad3D("data/3D/skydom.r3d", skydom);
            for (var i = 0; i < 3; i++) {
                skyimg[i] = new Image();
                skyimg[i].onload = function () {
                    dataload += 24;
                };
                skyimg[i].src = "data/3D/textures/sky" + (i + 1) + ".png";
            }
            haloimg = new Image();
            haloimg.onload = function () {
                dataload += 5;
            };
            haloimg.src = "data/3D/textures/halo.png";
            loadrad3D("data/3D/tiredisk.r3d", tiredisk);
            loadparticle("data/3D/tire.prt", tire);
            loadparticle("data/3D/tirelow.prt", tirelow);
            loadparticle("data/3D/cptext.prt", cptext);
            loadparticle("data/3D/fntext.prt", fntext);
            loadparticle("data/3D/bg.prt", bgst);
            for (var i = 0; i < 19; i++) {
                loadrad3D("data/3D/car" + i + ".r3d", carobj[i]);
                loadrad3D("data/3D/s" + i + ".r3d", shad[i]);
            }
            for (var i = 0; i < 19; i++) {
                cartexture[i] = new Image();
                cartexture[i].onload = function () {
                    dataload += 9;
                };
                cartexture[i].src = "data/3D/textures/car" + i + ".png";
            }
            for (var i = 0; i < 19; i++) {
                tireimg[i] = new Image();
                tireimg[i].onload = function () {
                    dataload += 2;
                };
                tireimg[i].src = "data/3D/textures/t" + i + ".png";
            }
            var defb = ["road", "froad", "twister2", "twister1", "turn", "offroad", "bumproad", "offturn", "nroad", "nturn", "roblend", "noblend", "rnblend", "roadend", "offroadend", "hpground", "ramp30", "cramp35", "dramp15", "dhilo15", "slide10", "takeoff", "sramp22", "offbump", "offramp", "sofframp", "halfpipe", "spikes", "rail", "thewall", "checkpoint", "fixpoint", "offcheckpoint", "sideoff", "bsideoff", "uprise", "riseroad", "sroad", "soffroad", "tside", "launchpad", "takeoffb", "speedramp", "offhill", "slider", "uphill", "roll1", "roll2", "roll3", "roll4", "roll5", "roll6", "opile1", "opile2", "aircheckpoint", "tree1", "tree2", "tree3", "tree4", "tree5", "tree6", "tree7", "tree8", "cac1", "cac2", "cac3"];
            for (var i = 0; i < 66; i++) {
                if (i != 40) {
                    loadrad3D("data/3D/" + defb[i] + ".r3d", build[i]);
                }
            }
            loadrad3D("data/3D/sprite.r3d", sprite);
            for (var i = 0; i < 3; i++) {
                spritexture[i] = new Image();
                spritexture[i].onload = function () {
                    dataload++;
                };
                spritexture[i].src = "data/3D/textures/sp" + i + ".png";
            }
            loadrad3D("data/3D/fixdisk.r3d", fixdisk);
            loadrad3D("data/3D/elec.r3d", elec);
            for (var i = 0; i < 3; i++) {
                loadrad3D("data/3D/exp" + i + ".r3d", explode[i]);
            }
            for (var i = 0; i < 19; i++) {
                loadtgroup(tgroup[i], i);
            }
            loadrad3D("data/3D/bg.r3d", bg3D);
            if (isphone) {
                for (var i = 0; i < 6; i++) {
                    contimg[i] = new Image();
                    contimg[i].onload = function () {
                        dataload++;
                    };
                    contimg[i].src = "data/interface" + rdres + "/cn" + i + ".png";
                }
                rosize = new Image();
                rosize.onload = function () {
                    dataload++;
                };
                rosize.src = "data/rotate.png";
            }
            for (var i = 0; i < 5; i++) {
                btimg[i] = new Image();
                btimg[i].onload = function () {
                    dataload++;
                };
                btimg[i].src = "data/interface" + rdres + "/btn" + (i + 1) + ".png";
            }
            for (var i = 0; i < 6; i++) {
                muimg[i] = new Image();
                muimg[i].onload = function () {
                    dataload++;
                };
                muimg[i].src = "data/interface" + rdres + "/mu" + i + ".png";
            }
            lbar = new Image();
            lbar.onload = function () {
                dataload++;
            };
            lbar.src = "data/interface" + rdres + "/lbar.png";
            rbar = new Image();
            rbar.onload = function () {
                dataload++;
            };
            rbar.src = "data/interface" + rdres + "/rbar.png";
            lckd = new Image();
            lckd.onload = function () {
                dataload++;
            };
            lckd.src = "data/interface" + rdres + "/locked.png";
            rewd = new Image();
            rewd.onload = function () {
                dataload++;
            };
            rewd.src = "data/interface" + rdres + "/reward.png";
            mainbg = new Image();
            mainbg.onload = function () {
                dataload += 402;
            };
            mainbg.src = "data/interface" + rdres + "/mainbg.png";
            rider = new Image();
            rider.onload = function () {
                dataload += 14;
            };
            rider.src = "data/interface" + rdres + "/rider.png";
            logo = new Image();
            logo.onload = function () {
                dataload += 20;
            };
            logo.src = "data/interface" + rdres + "/logo.png";
            for (var i = 0; i < 6; i++) {
                insano[i] = new Image();
                insano[i].onload = function () {
                    dataload += 20;
                };
                insano[i].src = "data/interface" + rdres + "/insano" + i + ".png";
            }
            for (var i = 0; i < 8; i++) {
                if ((i < 5) || (!isphone)) {
                    inst[i] = new Image();
                    inst[i].onload = function () {
                        dataload += 13;
                    };
                    inst[i].src = "data/interface1/int" + (i + 1) + ".png";
                }
            }
            reqload = true;
        }
        if (tiredisk.loaded == 1) {
            dataload++;
            tiredisk.loaded++;
        }
        if (tire.loaded == 1) {
            dataload++;
            tire.loaded++;
        }
        if (tirelow.loaded == 1) {
            dataload++;
            tirelow.loaded++;
        }
        if (cptext.loaded == 1) {
            dataload += 4;
            cptext.loaded++;
        }
        if (fntext.loaded == 1) {
            dataload += 4;
            fntext.loaded++;
        }
        if (bgst.loaded == 1) {
            dataload++;
            bgst.loaded++;
        }
        if ((ground.loaded) && (ground.loaded == (ground.nt + 1))) {
            dataload++;
            ground.loaded++;
        }
        if ((skydom.loaded) && (skydom.loaded == (skydom.nt + 1))) {
            dataload++;
            skydom.loaded++;
        }
        for (var i = 0; i < 19; i++) {
            if ((carobj[i].loaded) && (carobj[i].loaded == (carobj[i].nt + 1))) {
                dataload += 31;
                carobj[i].loaded++;
            }
        }
        for (var i = 0; i < 66; i++) {
            if ((i != 40) && (build[i].loaded) && (build[i].loaded == (build[i].nt + 1))) {
                dataload += 7;
                build[i].loaded++;
            }
        }
        for (var i = 0; i < 19; i++) {
            if (tgroup[i].loaded == 1) {
                dataload += 44;
                tgroup[i].loaded++;
            }
        }
        if ((sprite.loaded) && (sprite.loaded == (sprite.nt + 1))) {
            dataload++;
            sprite.loaded++;
        }
        if ((fixdisk.loaded) && (fixdisk.loaded == (fixdisk.nt + 1))) {
            dataload++;
            fixdisk.loaded++;
        }
        if ((elec.loaded) && (elec.loaded == (elec.nt + 1))) {
            dataload++;
            elec.loaded++;
        }
        for (var i = 0; i < 3; i++) {
            if ((explode[i].loaded) && (explode[i].loaded == (explode[i].nt + 1))) {
                dataload += 18;
                explode[i].loaded++;
            }
        }
        if ((bg3D.loaded) && (bg3D.loaded == (bg3D.nt + 1))) {
            dataload += 309;
            bg3D.loaded++;
        }
        if ((dataload == datacnt) && (pokiready)) {
			//
			//removed this, perhaps a skymad leftover?
            cartextures();
            createwheels();
            creatdustextures();
            onskip = false;
            sel[0] = getInfo("carsel");
            if (sel[0] == -1) {
                sel[0] = 0;
                onskip = true;
                onautocorrect = 2;
            }
            unlocked = getInfo("unlocked");
            if (unlocked == -1) {
                unlocked = 1;
            }
            cp.stage = unlocked;
            if (cp.stage == 17) {
                cp.stage = Math.floor(3 + (Math.random() * 13));
                canreset = true;
            }
            for (var i = 0; i < 4; i++) {
                rewlocked[i] = getInfo("rewlocked" + i + "");
                if (rewlocked[i] == -1) {
                    rewlocked[i] = 1;
                }
            }
            fredo = 0;
            fase = 1;
            if (onskip) {
                stageloadtyp = 2;
                stageload = -1;
                fase = 3;
            }
            for (var i = 0; i < 38; i++) {
                loadsnd(i);
            }
            loadingComplete();
        }
    } else {
        rd.fillStyle = "#000000";
        rd.fillRect(0, 0, canw, canh);
        rd.font = "" + (20 * (mh + mw)) + "px teko";
        rd.textAlign = "left";
        rd.textBaseline = "middle";
        rd.fillStyle = "#FFFFFF";
        rd.fillText("Sorry, your device does not seem to have WEBGL", (30 * mw), (100 * mh));
        rd.fillText("The game will not be able to work without it", (30 * mw), (160 * mh));
        rd.fillText("Please try the game on another device", (30 * mw), (220 * mh));
    }
}
var limr = 0, liml = 0, limt = 0, limb = 0;
var limro = 0, limlo = 0, limto = 0, limbo = 0;
var adod = 0;
var snap = [0, 0, 0];
var lvx = 0, lvy = 1, lvz = 0;
var fogdist = 10700;
var fogc = [];
var skyglass = [];
var hastip = 0;
var tip = [];
function newobo() {
    return {
        typ: 0,
        x: 0,
        z: 0,
        mat: null,
        bnd: [0, 0, 0, 0],
        iscp: 0
    };
}
var nb = 0;
var obo = [];
var stageload = 0;
function loadstage() {
    stageload = 1;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "data/stages/" + cp.stage + ".txt", true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var readlines = allText.split('\n');
                cp.n = 0;
                cp.nsp = 0;
                nb = 0;
                nf = 0;
                adod = 0;
                snap = [0, 0, 0];
                var skyc = [];
                var cloudsc = [];
                var cloudtyp = 0;
                lvx = 0;
                lvy = 1;
                lvz = 0;
                var bounds = [0, 0, 0, 0];
                var bounded = false;
                hastip = 0;
                for (var i = 0; i < readlines.length; i++) {
                    var line = readlines[i].trim();
                    if (strtsWith(line, "name")) {
                        cp.name = getStringValue("name", line, 0);
                    }
                    if (strtsWith(line, "nlaps")) {
                        cp.nlaps = getIntValue("nlaps", line, 0);
                    }
                    if (strtsWith(line, "addon")) {
                        adod = getIntValue("addon", line, 0);
                    }
                    if (strtsWith(line, "snap")) {
                        snap[0] = (getIntValue("snap", line, 0) / 100);
                        snap[1] = (getIntValue("snap", line, 1) / 100);
                        snap[2] = (getIntValue("snap", line, 2) / 100);
                    }
                    if (strtsWith(line, "sky")) {
                        skyc[0] = getIntValue("sky", line, 0);
                        skyc[1] = getIntValue("sky", line, 1);
                        skyc[2] = getIntValue("sky", line, 2);
                    }
                    if (strtsWith(line, "fog")) {
                        fogc[0] = getIntValue("fog", line, 0);
                        fogc[1] = getIntValue("fog", line, 1);
                        fogc[2] = getIntValue("fog", line, 2);
                    }
                    if (strtsWith(line, "clouds")) {
                        cloudsc[0] = getIntValue("clouds", line, 0);
                        cloudsc[1] = getIntValue("clouds", line, 1);
                        cloudsc[2] = getIntValue("clouds", line, 2);
                        cloudtyp = getIntValue("clouds", line, 3);
                    }
                    if (strtsWith(line, "ground")) {
                        groundtexture(getIntValue("ground", line, 3), getIntValue("ground", line, 0), getIntValue("ground", line, 1), getIntValue("ground", line, 2), getFloatValue("ground", line, 4), getFloatValue("ground", line, 5));
                    }
                    if ((cp.stage >= 3) && (unlocked == cp.stage)) {
                        if (strtsWith(line, "tip")) {
                            tip[hastip] = getStringValue("tip", line, 0);
                            tip[hastip] = tip[hastip].replace("[", "(");
                            tip[hastip] = tip[hastip].replace("]", ")");
                            tip[hastip] = tip[hastip].replace(";", ",");
                            hastip++;
                        }
                    }
                    if (strtsWith(line, "lightswingX")) {
                        var an = getIntValue("lightswingX", line, 0);
                        lvy = Math.cos(an * (Math.PI / 180));
                        an += 90;
                        lvx = Math.cos(an * (Math.PI / 180));
                    }
                    if (strtsWith(line, "lightswingZ")) {
                        var an = getIntValue("lightswingZ", line, 0);
                        lvy = Math.cos(an * (Math.PI / 180));
                        an += 90;
                        lvz = Math.cos(an * (Math.PI / 180));
                    }
                    if (strtsWith(line, "distfog")) {
                        fogdist = getIntValue("distfog", line, 0);
                    }
                    if (strtsWith(line, "bnd")) {
                        for (var k = 0; k < 4; k++) {
                            bounds[k] = getIntValue("bnd", line, k);
                        }
                        bounded = true;
                    }
                    if (strtsWith(line, "set")) {
                        obo[nb] = newobo();
                        obo[nb].mat = mat4.create();
                        obo[nb].typ = (getIntValue("set", line, 0) - 10);
                        if (bounded) {
                            for (var k = 0; k < 4; k++) {
                                obo[nb].bnd[k] = bounds[k];
                            }
                            bounded = false;
                        }
                        obo[nb].x =  - (getFloatValue("set", line, 1) / 10);
                        obo[nb].y = 0;
                        obo[nb].z = (getFloatValue("set", line, 2) / 10);
                        var rot = getFloatValue("set", line, 3);
                        mat4.rotate(obo[nb].mat, obo[nb].mat, (rot * (Math.PI / 180)), [0, 1, 0]);
                        if (Math.abs(rot) == 90) {
                            obo[nb].bx = build[obo[nb].typ].bz;
                            obo[nb].bz = build[obo[nb].typ].bx;
                        } else {
                            obo[nb].bx = build[obo[nb].typ].bx;
                            obo[nb].bz = build[obo[nb].typ].bz;
                        }
                        obo[nb].bx += 15;
                        obo[nb].bz += 15;
                        obo[nb].by = build[obo[nb].typ].by;
                        if (obo[nb].typ == 39) {
                            obo[nb].rot = rot;
                        }
                        if (line.indexOf(")p") != -1) {
                            cp.x[cp.n] = obo[nb].x;
                            cp.z[cp.n] = obo[nb].z;
                            cp.y[cp.n] = 0;
                            cp.typ[cp.n] = 0;
                            cp.obi[cp.n] = nb;
                            if (line.indexOf(")pt") != -1) {
                                cp.typ[cp.n] = -1;
                            }
                            if (line.indexOf(")pr") != -1) {
                                cp.typ[cp.n] = -2;
                            }
                            if (line.indexOf(")po") != -1) {
                                cp.typ[cp.n] = -3;
                            }
                            if (line.indexOf(")ph") != -1) {
                                cp.typ[cp.n] = -4;
                            }
                            cp.n++;
                        }
                        nb++;
                    }
                    if (strtsWith(line, "chk")) {
                        obo[nb] = newobo();
                        obo[nb].mat = mat4.create();
                        obo[nb].typ = (getIntValue("chk", line, 0) - 10);
                        obo[nb].x =  - (getFloatValue("chk", line, 1) / 10);
                        obo[nb].y = 0.4;
                        obo[nb].z = (getFloatValue("chk", line, 2) / 10);
                        var rot = getFloatValue("chk", line, 3);
                        mat4.rotate(obo[nb].mat, obo[nb].mat, (rot * (Math.PI / 180)), [0, 1, 0]);
                        if (obo[nb].typ == 54) {
                            obo[nb].y =  - (getFloatValue("chk", line, 4) / 10);
                        }
                        if (Math.abs(rot) == 90) {
                            obo[nb].bx = build[obo[nb].typ].bz;
                            obo[nb].bz = build[obo[nb].typ].bx;
                        } else {
                            obo[nb].bx = build[obo[nb].typ].bx;
                            obo[nb].bz = build[obo[nb].typ].bz;
                        }
                        obo[nb].bx += 15;
                        obo[nb].bz += 15;
                        obo[nb].by = build[obo[nb].typ].by;
                        cp.x[cp.n] = obo[nb].x;
                        cp.z[cp.n] = obo[nb].z;
                        cp.y[cp.n] = obo[nb].y;
                        cp.obi[cp.n] = nb;
                        if (rot == 0) {
                            cp.typ[cp.n] = 1;
                        } else {
                            cp.typ[cp.n] = 2;
                        }
                        cp.pcs = cp.n;
                        cp.n++;
                        cp.obn[cp.nsp] = nb;
                        cp.nsp++;
                        obo[nb].iscp = cp.nsp;
                        nb++;
                    }
                    if (strtsWith(line, "fix")) {
                        obo[nb] = newobo();
                        obo[nb].mat = mat4.create();
                        obo[nb].typ = (getIntValue("fix", line, 0) - 10);
                        obo[nb].x =  - (getFloatValue("fix", line, 1) / 10);
                        obo[nb].z = (getFloatValue("fix", line, 2) / 10);
                        obo[nb].y = ( - (getFloatValue("fix", line, 3) / 10) + 25);
                        var rot = getFloatValue("fix", line, 4);
                        mat4.rotate(obo[nb].mat, obo[nb].mat, (rot * (Math.PI / 180)), [0, 1, 0]);
                        if (line.indexOf(")s") != -1) {
                            cp.special[nf] = true;
                        } else {
                            cp.special[nf] = false;
                        }
                        fi[nf] = nb;
                        nf++;
                        nb++;
                    }
                    if (strtsWith(line, "maxr")) {
                        var num = getIntValue("maxr", line, 0);
                        var limit =  - (getFloatValue("maxr", line, 1) / 10);
                        limr = (limit + 5);
                        limro = nb;
                        var strt = (getFloatValue("maxr", line, 2) / 10);
                        for (var c = 0; c < num; c++) {
                            obo[nb] = newobo();
                            obo[nb].mat = mat4.create();
                            obo[nb].typ = 29;
                            obo[nb].x = limit;
                            obo[nb].y = 0;
                            obo[nb].z = ((c * 480) + strt);
                            nb++;
                        }
                    }
                    if (strtsWith(line, "maxl")) {
                        var num = getIntValue("maxl", line, 0);
                        var limit =  - (getFloatValue("maxl", line, 1) / 10);
                        liml = (limit - 5);
                        limlo = nb;
                        var strt = (getFloatValue("maxl", line, 2) / 10);
                        for (var c = 0; c < num; c++) {
                            obo[nb] = newobo();
                            obo[nb].mat = mat4.create();
                            obo[nb].typ = 29;
                            obo[nb].x = limit;
                            obo[nb].y = 0;
                            obo[nb].z = ((c * 480) + strt);
                            mat4.rotate(obo[nb].mat, obo[nb].mat, (180 * (Math.PI / 180)), [0, 1, 0]);
                            nb++;
                        }
                    }
                    if (strtsWith(line, "maxt")) {
                        var num = getIntValue("maxt", line, 0);
                        var limit = (getFloatValue("maxt", line, 1) / 10);
                        limt = (limit - 5);
                        limto = nb;
                        var strt = (-getFloatValue("maxt", line, 2) / 10);
                        for (var c = 0; c < num; c++) {
                            obo[nb] = newobo();
                            obo[nb].mat = mat4.create();
                            obo[nb].typ = 29;
                            obo[nb].x = ( - (c * 480) + strt);
                            obo[nb].y = 0;
                            obo[nb].z = limit;
                            mat4.rotate(obo[nb].mat, obo[nb].mat, (90 * (Math.PI / 180)), [0, 1, 0]);
                            nb++;
                        }
                    }
                    if (strtsWith(line, "maxb")) {
                        var num = getIntValue("maxb", line, 0);
                        var limit = (getFloatValue("maxb", line, 1) / 10);
                        limb = (limit + 5);
                        limbo = nb;
                        var strt = (-getFloatValue("maxb", line, 2) / 10);
                        for (var c = 0; c < num; c++) {
                            obo[nb] = newobo();
                            obo[nb].mat = mat4.create();
                            obo[nb].typ = 29;
                            obo[nb].x = ( - (c * 480) + strt);
                            obo[nb].y = 0;
                            obo[nb].z = limit;
                            mat4.rotate(obo[nb].mat, obo[nb].mat, (-90 * (Math.PI / 180)), [0, 1, 0]);
                            nb++;
                        }
                    }
                }
                cp.insih();
                sortcars(cp.stage);
                inishinter();
                inishcars();
                inishcontrol();
                inishmad();
                inishrecord();
                skytexture(skyc, fogc, cloudsc, cloudtyp);
                for (var i = 0; i < 3; i++) {
                    skyglass[i] = Math.round(((skyc[i] * 2) + 70) / 3);
                }
                gamecartextures();
                createsparks();
                colorcptext();
                nchp = 0;
                nspr = 0;
                ndst = 0;
                nexp = 0;
                if (stageloadtyp != 2) {
                    var opsnap = [ - (snap[0] * 3),  - (snap[1] * 3),  - (snap[2] * 3)];
                    setworld(opsnap, fogc, 0, 1, 0, 10700);
                } else {
                    setworld(snap, fogc, lvx, lvy, lvz, fogdist);
                }
                stageload = 2;
            }
        }
    };
    rawFile.send(null);
}
var nf = 0;
var fi = [];
var onelec = false;
function cpanimate() {
    for (var i = 0; i < nf; i++) {
        mat4.rotate(obo[fi[i]].mat, obo[fi[i]].mat, (11 * m * (Math.PI / 180)), [0, 0, 1]);
    }
    fixdisk.ont++;
    if (fixdisk.ont == 5) {
        fixdisk.ont = 0;
    }
    if (onelec) {
        elec.mat = mat4.create();
        mat4.rotate(elec.mat, elec.mat, (camxz * (Math.PI / 180)), [0, -1, 0]);
        mat4.rotate(elec.mat, elec.mat, (camzy * (Math.PI / 180)), [-1, 0, 0]);
        elec.ont++;
        if (elec.ont == 5) {
            elec.ont = 0;
        }
    }
    if (cp.stage == 1) {
        chkflk++;
    } else {
        chkflk += 0.2;
    }
    if (chkflk >= 5) {
        chkflk = 0;
    }
    if (oncheckpoint != -1) {
        cptext.x = obo[cp.obn[oncheckpoint]].x;
        cptext.y = (obo[cp.obn[oncheckpoint]].y + 80);
        cptext.z = obo[cp.obn[oncheckpoint]].z;
        for (var i = 0; i < 16; i++) {
            cptext.mat[i] = obo[cp.obn[oncheckpoint]].mat[i];
        }
        var flipit = false;
        if (Math.abs(cptext.mat[8]) > Math.abs(cptext.mat[10])) {
            if (camx < cptext.x) {
                cptext.x -= 6.7;
            } else {
                cptext.x += 6.7;
            }
            if ((cptext.mat[8] > 0) && (camx < cptext.x)) {
                flipit = true;
            }
            if ((cptext.mat[8] < 0) && (camx > cptext.x)) {
                flipit = true;
            }
        } else {
            if (camz < cptext.z) {
                cptext.z -= 6.7;
            } else {
                cptext.z += 6.7;
            }
            if ((cptext.mat[10] > 0) && (camz < cptext.z)) {
                flipit = true;
            }
            if ((cptext.mat[10] < 0) && (camz > cptext.z)) {
                flipit = true;
            }
        }
        if (flipit) {
            mat4.rotate(cptext.mat, cptext.mat, (180 * (Math.PI / 180)), [0, 1, 0]);
        }
        if (onlastcheck) {
            for (var i = 0; i < 16; i++) {
                fntext.mat[i] = cptext.mat[i];
            }
            fntext.x = obo[cp.obn[oncheckpoint]].x;
            fntext.y = (obo[cp.obn[oncheckpoint]].y + 52);
            fntext.z = obo[cp.obn[oncheckpoint]].z;
        }
    }
}
var nchp = 0;
var chip = [];
var carnchp = [0, 0, 0, 0, 0, 0, 0];
function chipaway(c, x, y, z, ctmag) {
    if ((carnchp[c] < 120) && (!onpausefr)) {
        var ui = -1;
        for (var i = 0; i < nchp; i++) {
            if (chip[i].loaded == 0) {
                ui = i;
                break;
            }
        }
        if (ui == -1) {
            ui = nchp;
            nchp++;
            carnchp[c]++;
        }
        if (ctmag > 0.4) {
            ctmag = 0.3;
        }
        if (ctmag < -0.4) {
            ctmag = -0.3;
        }
        chip[ui] = newrad3D();
        chip[i].rx = ((x * car[c].mat[0]) + (y * car[c].mat[4]) + (z * car[c].mat[8]));
        chip[i].ry = ((x * car[c].mat[1]) + (y * car[c].mat[5]) + (z * car[c].mat[9]));
        chip[i].rz = ((x * car[c].mat[2]) + (y * car[c].mat[6]) + (z * car[c].mat[10]));
        chip[i].cn = c;
        chip[ui].vx = (ctmag * (30 - (Math.random() * 60)));
        chip[ui].vy = (ctmag * (30 - (Math.random() * 60)));
        chip[ui].vz = (ctmag * (30 - (Math.random() * 60)));
        chip[ui].rtn1 = Math.floor(Math.random() * 5);
        if (chip[ui].rtn1 < 3) {
            chip[ui].rtn1mag = (Math.random() * 60);
        }
        chip[ui].rtn2 = Math.floor(Math.random() * 5);
        if (chip[ui].rtn2 < 3) {
            chip[ui].rtn2mag = (Math.random() * 60);
        }
        var ox = [];
        ox[0] = 0;
        var avox = 0;
        for (var i = 1; i < 3; i++) {
            ox[i] = (ox[0] + (ctmag * (10 - (Math.random() * 20))));
            avox += ox[i];
        }
        avox = (avox / 2);
        for (var i = 0; i < 3; i++) {
            ox[i] -= ((avox / 2) * (1 - (Math.random() * Math.random())));
        }
        var oy = [];
        oy[0] = 0;
        var avoy = 0;
        for (var i = 1; i < 3; i++) {
            oy[i] = (oy[0] + (ctmag * (10 - (Math.random() * 20))));
            avoy += oy[i];
        }
        avoy = (avoy / 2);
        for (var i = 0; i < 3; i++) {
            oy[i] -= ((avoy / 2) * (1 - (Math.random() * Math.random())));
        }
        var oz = [];
        oz[0] = 0;
        var avoz = 0;
        for (var i = 1; i < 3; i++) {
            oz[i] = (oz[0] + (ctmag * (10 - (Math.random() * 20))));
            avoz += oz[i];
        }
        avoz = (avoz / 2);
        for (var i = 0; i < 3; i++) {
            oz[i] -= ((avoz / 2) * (1 - (Math.random() * Math.random())));
        }
        var rmx = ((oy[1] - oy[0]) * (oz[2] - oz[0]) - (oz[1] - oz[0]) * (oy[2] - oy[0]));
        var rmy = ((oz[1] - oz[0]) * (ox[2] - ox[0]) - (ox[1] - ox[0]) * (oz[2] - oz[0]));
        var rmz = ((ox[1] - ox[0]) * (oy[2] - oy[0]) - (oy[1] - oy[0]) * (ox[2] - ox[0]));
        var normx = (rmx / Math.sqrt((rmx * rmx) + (rmy * rmy) + (rmz * rmz)));
        var normy = (rmy / Math.sqrt((rmx * rmx) + (rmy * rmy) + (rmz * rmz)));
        var normz = (rmz / Math.sqrt((rmx * rmx) + (rmy * rmy) + (rmz * rmz)));
        var indice = [];
        var vert = [];
        var norm = [];
        var texu = [];
        for (var i = 0; i < 3; i++) {
            indice[i] = i;
            vert[(i * 3)] = ox[i];
            vert[((i * 3) + 1)] = oy[i];
            vert[((i * 3) + 2)] = oz[i];
            norm[(i * 3)] = normx;
            norm[((i * 3) + 1)] = normy;
            norm[((i * 3) + 2)] = normz;
            texu[(i * 2)] = car[c].ctxl[0];
            texu[((i * 2) + 1)] = car[c].ctxl[1];
        }
        chip[ui].ni = 3;
        chip[ui].nt = 1;
        var roni = Math.random();
        if (roni > 0.334) {
            chip[ui].ownshade = true;
        }
        if (roni > 0.667) {
            chip[ui].ownlight = true;
        }
        chip[ui].vbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, chip[ui].vbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);
        chip[ui].nbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, chip[ui].nbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);
        chip[ui].tbuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, chip[ui].tbuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texu), gl.STATIC_DRAW);
        chip[ui].ibuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chip[ui].ibuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice), gl.STATIC_DRAW);
        chip[ui].mat = mat4.create();
        chip[ui].texture = carobj[car[c].typ].texture[1];
        chip[ui].loaded = 1;
    }
}
function chipsfly() {
    var nfly = false;
    for (var i = 0; i < nchp; i++) {
        if (chip[i].loaded) {
            chip[i].x = (car[chip[i].cn].x + chip[i].rx);
            chip[i].y = (car[chip[i].cn].y + chip[i].ry);
            chip[i].z = (car[chip[i].cn].z + chip[i].rz);
            chip[i].rx += (chip[i].vx * m);
            chip[i].ry += (chip[i].vy * m);
            chip[i].rz += (chip[i].vz * m);
            chip[i].vy -= (0.7 * m);
            if (chip[i].rtn1 < 3) {
                var a1rot = [0, 0, 0];
                a1rot[chip[i].rtn1] = 1;
                mat4.rotate(chip[i].mat, chip[i].mat, (chip[i].rtn1mag * (Math.PI / 180)), a1rot);
            }
            if (chip[i].rtn2 < 3) {
                var a2rot = [0, 0, 0];
                a2rot[chip[i].rtn2] = 1;
                mat4.rotate(chip[i].mat, chip[i].mat, (chip[i].rtn2mag * (Math.PI / 180)), a2rot);
            }
            if (frgm >= m) {
                chip[i].loaded++;
                if (chip[i].loaded == 100) {
                    chip[i].loaded = 0;
                }
            }
            if (chip[i].y < 0) {
                chip[i].loaded = 0;
            }
            if (chip[i].loaded == 0) {
                gl.deleteBuffer(chip[i].vbuf);
                chip[i].vbuf = null;
                gl.deleteBuffer(chip[i].tbuf);
                chip[i].tbuf = null;
                gl.deleteBuffer(chip[i].ibuf);
                chip[i].ibuf = null;
                chip[i].texture = null;
            } else {
                nfly = true;
            }
        }
    }
    if (!nfly) {
        nchp = 0;
        carnchp = [0, 0, 0, 0, 0, 0, 0];
    }
}
function newsprk() {
    return {
        typ: 0,
        stat: 0,
        x: 0,
        y: 0,
        z: 0,
        sp: 0,
        mat: null
    };
}
var nspr = 0;
var sprk = [];
function sprks(cn, x, y, z, sx, sy, sz, cap) {
    var vdist = Math.sqrt((sx * sx) + (sy * sy) + (sz * sz));
    if ((vdist > 5) && (!onpausefr)) {
        if (fase == 7) {
            recordsprks(cn, x, y, z, sx, sy, sz, cap);
        }
        var oli = 1;
        if (cap == 2) {
            if (Math.random() > Math.random()) {
                oli = 2;
            }
        }
        for (var ka = 0; ka < oli; ka++) {
            var ui = -1;
            for (var i = 0; i < nspr; i++) {
                if (sprk[i].stat == 0) {
                    ui = i;
                    break;
                }
            }
            if (ui == -1) {
                ui = nspr;
                nspr++;
            }
            sprk[ui] = newsprk();
            sprk[ui].typ = Math.floor(Math.random() * 6);
            if (sprk[ui].typ == 6) {
                sprk[ui].typ = 0;
            }
            sprk[ui].x = (x + ((Math.random() * 3) - 1.5));
            if (cap == 2) {
                sprk[ui].y = (y + (wlh[cn][0] * 2.4) + ((Math.random() * 3) - 1.5));
            } else {
                sprk[ui].y = (y + (Math.random() * 2));
            }
            sprk[ui].z = (z + ((Math.random() * 3) - 1.5));
            if (cap == 2) {
                sy -= (Math.random() * 1);
            } else {
                sx += ((Math.random() * 1) - 0.5);
                sz += ((Math.random() * 1) - 0.5);
            }
            sprk[ui].sp = (32 - (Math.random() * 2) - vdist);
            sprk[ui].sp *= 0.4;
            sprk[ui].mat = mat4.create();
            var vx =  - (sx / vdist);
            var vy =  - (sy / vdist);
            var vz =  - (sz / vdist);
            sprk[ui].mat[8] = vx;
            sprk[ui].mat[9] = vy;
            sprk[ui].mat[10] = vz;
            sprk[ui].mat[0] = vz;
            sprk[ui].mat[1] = 0;
            sprk[ui].mat[2] = vx;
            sprk[ui].mat[4] = -vx;
            sprk[ui].mat[5] = Math.sqrt(1 - (vy * vy));
            sprk[ui].mat[6] = -vz;
            sprk[ui].stat = 1;
        }
    }
}
function sprksfly() {
    var nfly = false;
    for (var i = 0; i < nspr; i++) {
        if (sprk[i].stat != 0) {
            sprk[i].x += (sprk[i].mat[8] * sprk[i].sp * m);
            sprk[i].y += (sprk[i].mat[9] * sprk[i].sp * m);
            sprk[i].z += (sprk[i].mat[10] * sprk[i].sp * m);
            sprk[i].stat++;
            if (sprk[i].stat == 8) {
                sprk[i].stat = 0;
            } else {
                nfly = true;
            }
        }
    }
    if (!nfly) {
        nspr = 0;
    }
}
function newdust() {
    return {
        stg: 0,
        x: 0,
        dy: 0,
        y: 0,
        z: 0,
        sx: 0,
        sz: 0,
        rot: 0,
        mag: 0,
        mat: null,
        tx: 0,
        ta: 0
    };
}
var ndst = 0;
var dust = [];
var dwer = [];
function dustup(tskd, c, mst, x, y, z, sx, sz, smag, tlt, capsz) {
    var tilted = false;
    if ((tlt > 5) && (mst == 0 || mst == 2)) {
        tilted = true;
    }
    if ((tlt < -5) && (mst == 1 || mst == 3)) {
        tilted = true;
    }
    var bk = ((Math.sqrt((sx * sx) + (sz * sz)) - 4) / 16);
    if (bk > 1) {
        bk = 1;
    }
    if ((bk > 0.2) && (!tilted) && (!onpausefr)) {
        if (fase == 7) {
            recordust(tskd, c, mst, x, y, z, sx, sz, smag, tlt, capsz);
        }
        var ui = -1;
        for (var i = 0; i < ndst; i++) {
            if (dust[i].stg == 0) {
                ui = i;
                break;
            }
        }
        if (ui == -1) {
            ui = ndst;
            ndst++;
        }
        dust[ui] = newdust();
        if (!capsz) {
            var fk = Math.random();
            dust[ui].x = ((x + (car[c].x * fk)) / (1 + fk));
            dust[ui].z = ((z + (car[c].z * fk)) / (1 + fk));
            dust[ui].dy = ((y + (car[c].y * fk)) / (1 + fk));
        } else {
            dust[ui].x = ((x + (car[c].x + sx)) / 2);
            dust[ui].z = ((z + (car[c].z + sz)) / 2);
            dust[ui].dy = y;
        }
        if (dust[ui].y < 0) {
            dust[ui].y = 0;
        }
        dust[ui].mag = (0.2 + (smag * bk * 0.8));
        var ron = Math.floor(4 * Math.random());
        if (ron == 4) {
            ron = 0;
        }
        dust[ui].rot = ((90 * ron) - 90);
        var sk = (0.1 + Math.random());
        if (sk > 1) {
            sk = 1;
        }
        dust[ui].sx = (sx * sk);
        dust[ui].sz = (sz * sk);
        dust[ui].stg = 1;
        dust[ui].tx = Math.floor(Math.random() * 3);
        if (dust[ui].tx == 3) {
            dust[ui].tx = 0;
        }
        if (tskd == 2) {
            dust[ui].tx += 3;
        }
        if (tskd == 1) {
            dust[ui].tx += 6;
        }
        dust[ui].ta = 0;
        dust[ui].mat = mat4.create();
        dwer[ui] = ui;
    }
}
function dustfly() {
    var nfly = false;
    for (var i = 0; i < ndst; i++) {
        if (dust[i].stg != 0) {
            if (!onpausefr) {
                dust[i].x += (dust[i].sx / (dust[i].stg + 1));
                dust[i].z += (dust[i].sz / (dust[i].stg + 1));
                dust[i].y = (dust[i].dy + (3 * dust[i].mag));
            }
            var fct = (1 / Math.sqrt((dust[i].sx * dust[i].sx) + (dust[i].sz * dust[i].sz)));
            var vfx = (dust[i].sx * fct * dust[i].sx * fct);
            var vfz = (dust[i].sz * fct * dust[i].sz * fct);
            var mlt = 1;
            if (vfx > vfz) {
                mlt = (1 + (1 - Math.abs((mcos(camxz) * mcos(camxz)) - vfx)));
            } else {
                mlt = (1 + (1 - Math.abs((msin(camxz) * msin(camxz)) - vfz)));
            }
            dust[i].mat = mat4.create();
            mat4.rotate(dust[i].mat, dust[i].mat, (camxz * (Math.PI / 180)), [0, -1, 0]);
            mat4.rotate(dust[i].mat, dust[i].mat, (camzy * (Math.PI / 180)), [-1, 0, 0]);
            mat4.rotate(dust[i].mat, dust[i].mat, (dust[i].rot * (Math.PI / 180)), [0, 0, 1]);
            var kmt = 0;
            if (Math.abs(dust[i].rot) == 90) {
                kmt = 1;
            }
            for (var k = 0; k < 3; k++) {
                var mt = 1;
                if (k == kmt) {
                    mt = mlt;
                }
                dust[i].mat[(k * 4)] *= (dust[i].mag * mt);
                dust[i].mat[((k * 4) + 1)] *= (dust[i].mag * mt);
                dust[i].mat[((k * 4) + 2)] *= (dust[i].mag * mt);
            }
            if (!onpausefr) {
                dust[i].mag += (0.05 + (Math.random() * 0.05));
                if (dust[i].stg >= 2) {
                    dust[i].ta += 0.45;
                    if (dust[i].ta > 4) {
                        dust[i].ta = 4;
                    }
                }
                if (dust[i].stg == 10) {
                    dust[i].stg = 0;
                } else {
                    dust[i].stg++;
                    nfly = true;
                }
            } else {
                nfly = true;
            }
        }
    }
    if (nfly) {
        var wer = [];
        var dustd = [];
        for (var i = 0; i < ndst; i++) {
            wer[i] = 0;
            dustd[i] = pyd(dust[i].x, camx, dust[i].y, camy, dust[i].z, camz);
        }
        for (var i = 0; i < ndst; i++) {
            for (var j = (i + 1); j < ndst; j++) {
                if (dustd[i] < dustd[j]) {
                    wer[i]++;
                } else {
                    wer[j]++;
                }
            }
            dwer[wer[i]] = i;
        }
    } else {
        ndst = 0;
    }
}
function newexp() {
    return {
        x: 0,
        y: 0,
        z: 0,
        rot: 0,
        vy: 0,
        vsx: 0,
        vsy: 0,
        vsz: 0,
        typ: 0,
        ani: -1,
        size: 0,
        mat: null,
        first: false
    };
}
var nexp = 0;
var exp = [];
var ewer = [];
function firexp(c, vsx, vsy, vsz) {
    var ui = -1;
    for (var i = 0; i < nexp; i++) {
        if (exp[i].ani == -1) {
            ui = i;
            break;
        }
    }
    if (ui == -1) {
        ui = nexp;
        nexp++;
    }
    var rad = carobj[car[c].typ];
    var ir = Math.floor(rad.ni * Math.random());
    if (ir == rad.ni) {
        ir = 0;
    }
    exp[ui] = newexp();
    exp[ui].x = (car[c].x + (rad.dvert[(ir * 3)] * car[c].mat[0]) + (rad.dvert[((ir * 3) + 1)] * car[c].mat[4]) + (rad.dvert[((ir * 3) + 2)] * car[c].mat[8]));
    exp[ui].y = (car[c].y + (rad.dvert[(ir * 3)] * car[c].mat[1]) + (rad.dvert[((ir * 3) + 1)] * car[c].mat[5]) + (rad.dvert[((ir * 3) + 2)] * car[c].mat[9]));
    exp[ui].z = (car[c].z + (rad.dvert[(ir * 3)] * car[c].mat[2]) + (rad.dvert[((ir * 3) + 1)] * car[c].mat[6]) + (rad.dvert[((ir * 3) + 2)] * car[c].mat[10]));
    exp[ui].vsx = vsx;
    exp[ui].vsy = vsy;
    exp[ui].vsz = vsz;
    exp[ui].vy = (0.4 + (Math.random() * 0.2));
    exp[ui].size = (0.6 + (Math.random() * 0.6));
    exp[ui].rot = (360 * Math.random());
    exp[ui].typ = Math.floor(Math.random() * 3);
    if (exp[ui].typ == 3) {
        exp[ui].typ = 0;
    }
    exp[ui].ani = 0;
    exp[ui].mat = mat4.create();
    exp[ui].first = false;
    ewer[ui] = ui;
}
function expburn() {
    var nfly = false;
    for (var i = 0; i < nexp; i++) {
        if (exp[i].ani != -1) {
            exp[i].mat = mat4.create();
            mat4.rotate(exp[i].mat, exp[i].mat, (camxz * (Math.PI / 180)), [0, -1, 0]);
            mat4.rotate(exp[i].mat, exp[i].mat, (camzy * (Math.PI / 180)), [-1, 0, 0]);
            mat4.rotate(exp[i].mat, exp[i].mat, (exp[i].rot * (Math.PI / 180)), [0, 0, 1]);
            for (var k = 0; k < 3; k++) {
                exp[i].mat[(k * 4)] *= exp[i].size;
                exp[i].mat[((k * 4) + 1)] *= exp[i].size;
                exp[i].mat[((k * 4) + 2)] *= exp[i].size;
            }
            exp[i].y += exp[i].vy;
            if (exp[i].first) {
                exp[i].x += (exp[i].vsx * m);
                exp[i].vsx *= 0.95;
                exp[i].y += (exp[i].vsy * m);
                exp[i].vsy *= 0.95;
                exp[i].z += (exp[i].vsz * m);
                exp[i].vsz *= 0.95;
                exp[i].size += (exp[i].size * 0.05 * m);
                exp[i].ani += (0.85 * m);
            } else {
                exp[i].first = true;
            }
            if (exp[i].ani >= 6) {
                exp[i].ani = -1;
            } else {
                nfly = true;
            }
        }
    }
    if (nfly) {
        var wer = [];
        var expd = [];
        for (var i = 0; i < nexp; i++) {
            wer[i] = 0;
            expd[i] = pyd(exp[i].x, camx, exp[i].y, camy, exp[i].z, camz);
        }
        for (var i = 0; i < nexp; i++) {
            for (var j = (i + 1); j < nexp; j++) {
                if (expd[i] < expd[j]) {
                    wer[i]++;
                } else {
                    wer[j]++;
                }
            }
            ewer[wer[i]] = i;
        }
    } else {
        nexp = 0;
    }
}
function newsmoke() {
    return {
        x: 0,
        y: 0,
        z: 0,
        sx: 0,
        sy: 0,
        rot: 0,
        mat: null
    };
}
var smoke = [];
for (var i = 0; i < 3; i++) {
    smoke[i] = newsmoke();
}
var camx = 0, camy = 0, camz = 0;
var camzy = 30, camxz = -90;
var cmat = null;
var camode = 0;
var cim = 0;
var cim2 = 0;
var lookback = 0;
var bcxz = 0;
var high = false;
var vxz = 0;
var adv = 50;
var ronf = 0;
var vert = false;
var td = false;
var htrns = 0;
var updateframe = false;
function gameworks() {
    var fieldOfView = ((55 * Math.PI) / 180);
    var aspect = (canw / canh);
    var zNear = 0.1;
    var zFar = 7000;
    cmat = mat4.create();
    mat4.perspective(cmat, fieldOfView, aspect, zNear, zFar);
    onelec = false;
    if (fase == 7) {
        if (starcnt == 0) {
            drive();
            setwheelspos();
            shadoworks();
            chipsfly();
            sprksfly();
            dustfly();
            expburn();
            cpanimate();
            record();
            checkstat();
            control();
            drawinter();
            enginsnd();
        } else {
            if (starcnt == 186) {
                adv = 190;
                camzy = 40;
                vxz = 250;
                cim = 3;
                high = true;
                ronf = 0;
                camode = 1;
            }
            if (starcnt != 0) {
                starcnt--;
            }
            setwheelspos();
            shadoworks();
            cpanimate();
            drawinter();
            var usedskip = false;
            if (starcnt < 65) {
                enginsnd();
            } else {
                if ((cp.stage == 2) && (unlocked == 2) && (shownbordo != 2)) {
                    drawonbordo();
                }
                if ((cp.stage == 4) && (unlocked == 4) && (shownbordo != 4)) {
                    drawonbordo();
                }
            }
            if (starcnt > 65) {
                if (enter == 1 || u[0].handb || (mdown)) {
                    starcnt = 65;
                    if (enter == 1) {
                        enter = 2;
                    }
                    u[0].handb = false;
                    usedskip = true;
                }
            }
            if (starcnt == 65) {
                vert = false;
                adv = 90;
                vxz = 0;
                cim = 0;
                high = false;
                ronf = 0;
                camode = 0;
                revfase = 0;
                reqpbr = 1;
                rd.fillStyle = "#FFFFFF";
                rd.fillRect(0, 0, canw, canh);
                if ((cp.stage == 2) && (unlocked == 2) && (shownbordo != 2) && (!usedskip)) {
                    shownbordo = 2;
                }
                if ((cp.stage == 4) && (unlocked == 4) && (shownbordo != 4) && (!usedskip)) {
                    shownbordo = 4;
                }
            }
            if (starcnt >= 183) {
                if (starcnt == 183) {
                    rd.globalAlpha = 0.5;
                }
                rd.fillStyle = "#FFFFFF";
                rd.fillRect(0, 0, canw, canh);
                rd.globalAlpha = 1;
            }
        }
    }
    if (fase == 8) {
        replay();
        setwheelspos();
        shadoworks();
        chipsfly();
        sprksfly();
        dustfly();
        expburn();
        cpanimate();
        drawreplay()
    }
    if (fase == 10) {
        hreplay();
        setwheelspos();
        shadoworks();
        if (!onpausefr) {
            chipsfly();
            sprksfly();
        }
        dustfly();
        expburn();
        cpanimate();
        drawhreplay();
    }
    if (camode == 0) {
        camzy = 10;
        var bado = (2 + (Math.abs(bcxz) / 4));
        if (bado > 20) {
            bado = 20;
        }
        bado *= m;
        if (lookback != 0) {
            if (lookback == 1) {
                if (bcxz < 180) {
                    bcxz += bado;
                }
                if (bcxz > 180) {
                    bcxz = 180;
                }
            }
            if (lookback == -1) {
                if (bcxz > -180) {
                    bcxz -= bado;
                }
                if (bcxz < -180) {
                    bcxz = -180;
                }
            }
        } else {
            if (Math.abs(bcxz) > bado) {
                if (bcxz > 0) {
                    bcxz -= bado;
                } else {
                    bcxz += bado;
                }
            } else {
                if (bcxz != 0) {
                    bcxz = 0;
                }
            }
        }
        var kcxz = (cxz[cim] - 180 + bcxz);
        camxz = kcxz;
        camx = (car[cim].x - (80 * msin(kcxz)));
        camz = (car[cim].z + (80 * mcos(kcxz)));
        camy = (car[cim].y + 25);
    }
    if (camode == 1) {
        if (!high) {
            if (!vert) {
                adv += (0.2 * m);
            } else {
                adv -= (0.2 * m);
            }
            if (adv > 90) {
                vert = true;
            }
            if (adv < -50) {
                vert = false;
            }
        } else {
            adv -= (1.4 * m);
            if (adv < 61.7) {
                adv = 61.7;
            }
        }
        var amp = (50 + adv);
        if (high) {
            if (amp < 130) {
                amp = 130;
            }
        }
        if (amp < 100) {
            amp = 100;
        }
        camy = (car[cim].y + adv);
        if (camy < 5) {
            vert = false;
        }
        camx = car[cim].x + (amp * mcos(vxz));
        camz = car[cim].z + (amp * msin(vxz));
        if (!high) {
            vxz -= (2 * m);
        } else {
            vxz -= (4 * m);
        }
        var ad = 0;
        var ty = camy;
        if (ty < 0) {
            ty = 0;
        }
        if ((car[cim].y - ty) < 0) {
            ad = -180;
        }
        var max = Math.sqrt((((car[cim].z - camz) * (car[cim].z - camz)) + ((car[cim].x - camx) * (car[cim].x - camx))));
        var rzy =  - (90 + ad - (Math.atan((max / (car[cim].y - ty))) / 0.017453292519943295));
        camxz =  - (-vxz + 90);
        if (high) {
            rzy -= ronf;
            ronf += 0.2;
            if (ronf > 15) {
                ronf = 15;
            }
        }
        camzy += ((rzy - camzy) / 10);
    }
    if (camode == 2) {
        if (td) {
            var sidn = 1;
            if (Math.random() > Math.random()) {
                sidn = -1;
            }
            camy = (car[cim].y + 10 + (160 * Math.random()));
            camx = (car[cim].x + (40 * sidn * mcos(mxz[cim])) - (500 * msin(mxz[cim])));
            camz = (car[cim].z + (40 * sidn * msin(mxz[cim])) + (500 * mcos(mxz[cim])));
            td = false;
        }
        var ad = 0;
        if ((car[cim].x - camx) > 0) {
            ad = 180;
        }
        var rxz =  - (90 + ad + (Math.atan(((car[cim].z - camz) /  - (car[cim].x - camx))) / 0.017453292519943295));
        ad = 0;
        if ((car[cim].y - camy) < 0) {
            ad = -180;
        }
        var max = Math.sqrt((((car[cim].z - camz) * (car[cim].z - camz)) + ((car[cim].x - camx) * (car[cim].x - camx))));
        var rzy =  - (90 + ad - (Math.atan((max / (car[cim].y - camy))) / 0.017453292519943295));
        while (rxz < 0) {
            rxz += 360;
        }
        while (rxz > 360) {
            rxz -= 360;
        }
        camxz = rxz;
        camzy += ((rzy - camzy) / 5);
        if (Math.sqrt((((car[cim].z - camz) * (car[cim].z - camz)) + ((car[cim].x - camx) * (car[cim].x - camx)) + ((car[cim].y - camy) * (car[cim].y - camy)))) > 700) {
            td = true;
        }
    }
    if (camode == 3) {
        var trnx = (((car[cim].x * (30 - htrns)) + (car[cim2].x * htrns)) / 30);
        var trny = (((car[cim].y * (30 - htrns)) + (car[cim2].y * htrns)) / 30);
        var trnz = (((car[cim].z * (30 - htrns)) + (car[cim2].z * htrns)) / 30);
        if (!vert) {
            adv += (0.2 * m);
        } else {
            adv -= (0.2 * m);
        }
        if (adv > 90) {
            vert = true;
        }
        if (adv < -50) {
            vert = false;
        }
        var amp = (50 + adv);
        if (amp < 100) {
            amp = 100;
        }
        camy = (trny + adv);
        if (camy < 5) {
            vert = false;
        }
        camx = trnx + (amp * mcos(vxz));
        camz = trnz + (amp * msin(vxz));
        vxz -= (2 * m);
        var ad = 0;
        var ty = camy;
        if (ty < 0) {
            ty = 0;
        }
        if ((trny - ty) < 0) {
            ad = -180;
        }
        var max = Math.sqrt((((trnz - camz) * (trnz - camz)) + ((trnx - camx) * (trnx - camx))));
        var rzy =  - (90 + ad - (Math.atan((max / (trny - ty))) / 0.017453292519943295));
        camxz =  - (-vxz + 90);
        camzy += ((rzy - camzy) / 10);
    }
    skydom.x = camx;
    skydom.z = camz;
    var skf = (0.6 + (camy / 4000));
    skydom.mat = mat4.create();
    skydom.mat[4] *= skf;
    skydom.mat[5] *= skf;
    skydom.mat[6] *= skf;
    mat4.rotate(cmat, cmat, (camzy * (Math.PI / 180)), [1, 0, 0]);
    mat4.rotate(cmat, cmat, (camxz * (Math.PI / 180)), [0, 1, 0]);
    updateframe = true;
}
var csxz = 0, cszy = 0;
var carup = 0;
var carmy = 100;
var carms = 0;
var flyout = 1;
var nextc = 0;
function newsmoke() {
    return {
        x: 0,
        y: 0,
        z: 0,
        sx: 0,
        sy: 0,
        rot: 0,
        rota: 0,
        mat: null
    };
}
var smoke = [];
for (var i = 0; i < 9; i++) {
    smoke[i] = newsmoke();
    smoke[i].rot = (360 * Math.random());
    smoke[i].rota = (1 + (3 * Math.random()));
    if (Math.random() > Math.random()) {
        smoke[i].rota *= -1;
    }
    smoke[i].x = (60 - 120 * Math.random());
    smoke[i].y = (3 + (52 * Math.random()));
    smoke[i].sx = (0.05 + (Math.random() * 0.3));
    if (Math.random() > Math.random()) {
        smoke[i].sx *= -1;
    }
    smoke[i].sy = (0.1 + (Math.random() * 0.4));
    if (Math.random() > Math.random()) {
        smoke[i].sy *= -1;
    }
}
function carselect() {
    var fieldOfView = ((55 * Math.PI) / 180);
    var aspect = (canw / canh);
    var zNear = 0.1;
    var zFar = 7000;
    cmat = mat4.create();
    mat4.perspective(cmat, fieldOfView, aspect, zNear, zFar);
    camx = 0;
    camy = 0;
    camz = 0;
    camxz = 0;
    camzy = -8;
    bg3D.x = 0;
    bg3D.y = 14;
    bg3D.z = -99;
    bg3D.mat = mat4.create();
    mat4.rotate(bg3D.mat, bg3D.mat, (camzy * (Math.PI / 180)), [-1, 0, 0]);
    for (var i = 0; i < 9; i++) {
        smoke[i].mat = mat4.create();
        smoke[i].x += smoke[i].sx;
        if ((smoke[i].sx < 0) && (smoke[i].x < -60)) {
            smoke[i].sx = (0.05 + (Math.random() * 0.3));
            smoke[i].rota = (1 + (3 * Math.random()));
            if (Math.random() > Math.random()) {
                smoke[i].rota *= -1;
            }
        }
        if ((smoke[i].sx > 0) && (smoke[i].x > 60)) {
            smoke[i].sx =  - (0.05 + (Math.random() * 0.3));
            smoke[i].rota = (1 + (3 * Math.random()));
            if (Math.random() > Math.random()) {
                smoke[i].rota *= -1;
            }
        }
        smoke[i].y += smoke[i].sy;
        if ((smoke[i].sy < 0) && (smoke[i].y < 3)) {
            smoke[i].sy = (0.1 + (Math.random() * 0.4));
            smoke[i].rota = (1 + (3 * Math.random()));
            if (Math.random() > Math.random()) {
                smoke[i].rota *= -1;
            }
        }
        if ((smoke[i].sy > 0) && (smoke[i].y > 55)) {
            smoke[i].sy =  - (0.1 + (Math.random() * 0.4));
            smoke[i].rota = (1 + (3 * Math.random()));
            if (Math.random() > Math.random()) {
                smoke[i].rota *= -1;
            }
        }
        smoke[i].z = -99;
        for (var k = 0; k < 3; k++) {
            smoke[i].mat[k] = (bg3D.mat[k] * 4);
            smoke[i].mat[(k + 4)] = (bg3D.mat[(k + 4)] * 4);
            smoke[i].mat[(k + 8)] = (bg3D.mat[(k + 8)] * 4);
        }
        mat4.rotate(smoke[i].mat, smoke[i].mat, (smoke[i].rot * (Math.PI / 180)), [0, 0, 1]);
        smoke[i].rot += smoke[i].rota;
        if (smoke[i].rot > 360) {
            smoke[i].rot -= 360;
        }
        if (smoke[i].rot < 0) {
            smoke[i].rot += 360;
        }
    }
    if (flyout == 0) {
        if (carup >= 1) {
            if (carup == 1) {
                carmy += (0.7 + ((11 - carmy) / 31));
                if (carmy > 10) {
                    carmy = 10;
                    carup = 2;
                }
            }
            if (carup >= 2) {
                carup++;
                if (carup == 110) {
                    carup = 0;
                }
            }
        } else {
            if (carup == 0) {
                carmy -= (0.2 + ((11 - carmy) / 31));
                if (carmy < -21) {
                    carmy = -21;
                    carup = -1;
                }
            }
            if (carup <= -1) {
                carup--;
                if (carup == -50) {
                    carup = 1;
                }
            }
        }
    } else {
        if (flyout == 1) {
            cszy = 0;
            carms += 0.5;
            if (carms > 10) {
                camrs = 10;
            }
            carmy -= carms;
            if (carmy < -21) {
                carmy = -21;
                carup = -30;
                flyout = 0;
            }
        }
        if (flyout == 2) {
            carmy += 7;
            if (nextc == 1) {
                cszy += 20;
            }
            if (nextc == -1) {
                cszy -= 20;
            }
            if (carmy > 100) {
                if (nextc == 1) {
                    sel[0]++;
                    if (sel[0] == 19) {
                        sel[0] = 0;
                    }
                }
                if (nextc == -1) {
                    sel[0]--;
                    if (sel[0] == -1) {
                        sel[0] = 18;
                    }
                }
                flyout = 1;
                carms = 0;
                carmy = 100;
            }
        }
    }
    carobj[sel[0]].x = 0;
    carobj[sel[0]].y = (wly[sel[0]][1] + (1.5 * wlh[sel[0]][1]) + carmy);
    carobj[sel[0]].z = -98;
    carobj[sel[0]].ont = 0;
    csxz += 5;
    if (csxz > 360) {
        csxz -= 360;
    }
    var xmt = [1, 0, 0];
    var ymt = [0, 1, 0];
    var zmt = [0, 0, 1];
    rotomat(ymt, zmt, cszy);
    rotomat(xmt, zmt, csxz);
    carobj[sel[0]].mat[0] = xmt[0];
    carobj[sel[0]].mat[1] = ymt[0];
    carobj[sel[0]].mat[2] = zmt[0];
    carobj[sel[0]].mat[4] = xmt[1];
    carobj[sel[0]].mat[5] = ymt[1];
    carobj[sel[0]].mat[6] = zmt[1];
    carobj[sel[0]].mat[8] = xmt[2];
    carobj[sel[0]].mat[9] = ymt[2];
    carobj[sel[0]].mat[10] = zmt[2];
    whl[sel[0]][0].x = (carobj[sel[0]].x - (wlx[sel[0]][0] * carobj[sel[0]].mat[0]) - (wly[sel[0]][0] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[8]));
    whl[sel[0]][0].y = (carobj[sel[0]].y - (wlx[sel[0]][0] * carobj[sel[0]].mat[1]) - (wly[sel[0]][0] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[9]));
    whl[sel[0]][0].z = (carobj[sel[0]].z - (wlx[sel[0]][0] * carobj[sel[0]].mat[2]) - (wly[sel[0]][0] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[10]));
    whl[sel[0]][0].mat = mat4.create();
    for (var k = 0; k < 12; k++) {
        whl[sel[0]][0].mat[k] = carobj[sel[0]].mat[k];
    }
    mat4.rotate(whl[sel[0]][0].mat, whl[sel[0]][0].mat, (90 * (Math.PI / 180)), [0, 1, 0]);
    whl[sel[0]][1].x = (carobj[sel[0]].x + (wlx[sel[0]][0] * carobj[sel[0]].mat[0]) - (wly[sel[0]][0] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[8]));
    whl[sel[0]][1].y = (carobj[sel[0]].y + (wlx[sel[0]][0] * carobj[sel[0]].mat[1]) - (wly[sel[0]][0] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[9]));
    whl[sel[0]][1].z = (carobj[sel[0]].z + (wlx[sel[0]][0] * carobj[sel[0]].mat[2]) - (wly[sel[0]][0] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[10]));
    whl[sel[0]][1].mat = mat4.create();
    for (var k = 0; k < 12; k++) {
        whl[sel[0]][1].mat[k] = carobj[sel[0]].mat[k];
    }
    mat4.rotate(whl[sel[0]][1].mat, whl[sel[0]][1].mat, (-90 * (Math.PI / 180)), [0, 1, 0]);
    whl[sel[0]][2].x = (carobj[sel[0]].x - (wlx[sel[0]][1] * carobj[sel[0]].mat[0]) - (wly[sel[0]][1] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[8]));
    whl[sel[0]][2].y = (carobj[sel[0]].y - (wlx[sel[0]][1] * carobj[sel[0]].mat[1]) - (wly[sel[0]][1] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[9]));
    whl[sel[0]][2].z = (carobj[sel[0]].z - (wlx[sel[0]][1] * carobj[sel[0]].mat[2]) - (wly[sel[0]][1] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[10]));
    whl[sel[0]][2].mat = mat4.create();
    for (var k = 0; k < 12; k++) {
        whl[sel[0]][2].mat[k] = carobj[sel[0]].mat[k];
    }
    mat4.rotate(whl[sel[0]][2].mat, whl[sel[0]][2].mat, (90 * (Math.PI / 180)), [0, 1, 0]);
    whl[sel[0]][3].x = (carobj[sel[0]].x + (wlx[sel[0]][1] * carobj[sel[0]].mat[0]) - (wly[sel[0]][1] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[8]));
    whl[sel[0]][3].y = (carobj[sel[0]].y + (wlx[sel[0]][1] * carobj[sel[0]].mat[1]) - (wly[sel[0]][1] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[9]));
    whl[sel[0]][3].z = (carobj[sel[0]].z + (wlx[sel[0]][1] * carobj[sel[0]].mat[2]) - (wly[sel[0]][1] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[10]));
    whl[sel[0]][3].mat = mat4.create();
    for (var k = 0; k < 12; k++) {
        whl[sel[0]][3].mat[k] = carobj[sel[0]].mat[k];
    }
    mat4.rotate(whl[sel[0]][3].mat, whl[sel[0]][3].mat, (-90 * (Math.PI / 180)), [0, 1, 0]);
    var cat = 0.5;
    if (Math.abs(carobj[sel[0]].mat[9]) > Math.abs(carobj[sel[0]].mat[1])) {
        cat = 0.4;
    }
    if (Math.abs(carobj[sel[0]].mat[5]) < cat) {
        if (Math.abs(carobj[sel[0]].mat[9]) > Math.abs(carobj[sel[0]].mat[1])) {
            shad[sel[0]].ont = 2;
            shad[sel[0]].x = carobj[sel[0]].x;
            shad[sel[0]].z = carobj[sel[0]].z;
            shad[sel[0]].mat[0] = carobj[sel[0]].mat[0];
            shad[sel[0]].mat[2] = carobj[sel[0]].mat[2];
            shad[sel[0]].mat[4] = carobj[sel[0]].mat[8];
            shad[sel[0]].mat[6] = carobj[sel[0]].mat[10];
            shad[sel[0]].mat[8] = -carobj[sel[0]].mat[4];
            shad[sel[0]].mat[10] = -carobj[sel[0]].mat[6];
        } else {
            shad[sel[0]].ont = 1;
            shad[sel[0]].x = (carobj[sel[0]].x - (shadadj[sel[0]] * carobj[sel[0]].mat[8]));
            shad[sel[0]].z = (carobj[sel[0]].z - (shadadj[sel[0]] * carobj[sel[0]].mat[10]));
            shad[sel[0]].mat[0] = carobj[sel[0]].mat[8];
            shad[sel[0]].mat[2] = carobj[sel[0]].mat[10];
            shad[sel[0]].mat[4] = carobj[sel[0]].mat[0];
            shad[sel[0]].mat[6] = carobj[sel[0]].mat[2];
            shad[sel[0]].mat[8] = -carobj[sel[0]].mat[4];
            shad[sel[0]].mat[10] = -carobj[sel[0]].mat[6];
        }
    } else {
        shad[sel[0]].ont = 0;
        shad[sel[0]].x = (carobj[sel[0]].x - (shadadj[sel[0]] * carobj[sel[0]].mat[8]));
        shad[sel[0]].z = (carobj[sel[0]].z - (shadadj[sel[0]] * carobj[sel[0]].mat[10]));
        shad[sel[0]].mat[0] = carobj[sel[0]].mat[8];
        shad[sel[0]].mat[2] = carobj[sel[0]].mat[10];
        shad[sel[0]].mat[4] = carobj[sel[0]].mat[4];
        shad[sel[0]].mat[6] = carobj[sel[0]].mat[6];
        shad[sel[0]].mat[8] = carobj[sel[0]].mat[0];
        shad[sel[0]].mat[10] = carobj[sel[0]].mat[2];
    }
    shad[sel[0]].mat[1] = 0;
    shad[sel[0]].mat[5] = 1;
    shad[sel[0]].mat[9] = 0;
    shad[sel[0]].y = -21;
    mat4.rotate(cmat, cmat, (camzy * (Math.PI / 180)), [1, 0, 0]);
    drawcarselect();
    updateframe = true;
}
var hit = 4500, ptr = 0, ptcnt = -10, nrnd = 0;
var trx = 0, trz = 0, atrx = 0, atrz = 0;
var fallen = 0;
function stageselect() {
    var fieldOfView = ((55 * Math.PI) / 180);
    var aspect = (canw / canh);
    var zNear = 0.1;
    var zFar = 7000;
    cmat = mat4.create();
    mat4.perspective(cmat, fieldOfView, aspect, zNear, zFar);
    camy = (hit + 100);
    camx = (trx - (1700 * msin(camxz)));
    camz = (trz + (1700 * mcos(camxz)));
    if (hit > 500) {
        if (hit == 4500) {
            ptr = 0;
            nrnd = 0;
            ptcnt = 0;
            camzy = 67;
            atrx = ((cp.x[0] - trx) / 116);
            atrz = ((cp.z[0] - trz) / 116);
        }
        hit -= fallen;
        fallen += 0.7;
        trx += atrx;
        trz += atrz;
        if (hit < 1760) {
            camzy -= 2;
        }
        if (fallen > 50) {
            fallen = 50;
        }
        if (hit <= 500) {
            hit = 500;
            fallen = 0;
        }
        vxz += 3;
    } else {
        vxz++;
        trx -= ((trx - cp.x[ptr]) / 10);
        trz -= ((trz - cp.z[ptr]) / 10);
        if (ptcnt == 10) {
            ptr++;
            if (ptr == cp.n) {
                ptr = 0;
                nrnd++;
            }
            ptcnt = 0;
        } else {
            ptcnt++;
        }
    }
    if (vxz > 360) {
        vxz -= 360;
    }
    camxz = vxz;
    for (var i = 0; i < nf; i++) {
        mat4.rotate(obo[fi[i]].mat, obo[fi[i]].mat, (11 * m * (Math.PI / 180)), [0, 0, 1]);
    }
    fixdisk.ont++;
    if (fixdisk.ont == 5) {
        fixdisk.ont = 0;
    }
    chkflk++;
    if (chkflk >= 5) {
        chkflk = 0;
    }
    bgst.mat = mat4.create();
    mat4.rotate(bgst.mat, bgst.mat, (camxz * (Math.PI / 180)), [0, -1, 0]);
    mat4.rotate(bgst.mat, bgst.mat, (camzy * (Math.PI / 180)), [-1, 0, 0]);
    bgst.mat[0] *= (aspect * 0.5625);
    bgst.mat[1] *= (aspect * 0.5625);
    bgst.mat[2] *= (aspect * 0.5625);
    bgst.x = (camx - (106 * bgst.mat[8]));
    bgst.y = (camy - (106 * bgst.mat[9]));
    bgst.z = (camz - (106 * bgst.mat[10]));
    mat4.rotate(cmat, cmat, (camzy * (Math.PI / 180)), [1, 0, 0]);
    mat4.rotate(cmat, cmat, (camxz * (Math.PI / 180)), [0, 1, 0]);
    drawstageselect();
    updateframe = true;
}
function unlockedcar() {
    if (fredo == 76) {
        var fieldOfView = ((55 * Math.PI) / 180);
        var aspect = (canw / canh);
        var zNear = 0.1;
        var zFar = 7000;
        cmat = mat4.create();
        mat4.perspective(cmat, fieldOfView, aspect, zNear, zFar);
        camx = 0;
        camy = 0;
        camz = 0;
        camxz = 0;
        camzy = 0;
        carobj[sel[0]].x = 0;
        carobj[sel[0]].y = (wly[sel[0]][1] + (1.5 * wlh[sel[0]][1]) - 17);
        carobj[sel[0]].z = -80;
        carobj[sel[0]].ont = 0;
        csxz += 2;
        if (csxz > 360) {
            csxz -= 360;
        }
        cszy = carmy;
        if (carup) {
            carmy++;
            if (carmy > 20) {
                carmy = 20;
            }
        } else {
            carmy--;
            if (carmy < -20) {
                carmy = -20;
            }
        }
        carms--;
        if (carms == 0) {
            if (carup == 0) {
                carup = 1;
            } else {
                carup = 0;
            }
            carms = 100;
        }
        var xmt = [1, 0, 0];
        var ymt = [0, 1, 0];
        var zmt = [0, 0, 1];
        rotomat(ymt, zmt, cszy);
        rotomat(xmt, zmt, csxz);
        carobj[sel[0]].mat[0] = xmt[0];
        carobj[sel[0]].mat[1] = ymt[0];
        carobj[sel[0]].mat[2] = zmt[0];
        carobj[sel[0]].mat[4] = xmt[1];
        carobj[sel[0]].mat[5] = ymt[1];
        carobj[sel[0]].mat[6] = zmt[1];
        carobj[sel[0]].mat[8] = xmt[2];
        carobj[sel[0]].mat[9] = ymt[2];
        carobj[sel[0]].mat[10] = zmt[2];
        whl[sel[0]][0].x = (carobj[sel[0]].x - (wlx[sel[0]][0] * carobj[sel[0]].mat[0]) - (wly[sel[0]][0] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[8]));
        whl[sel[0]][0].y = (carobj[sel[0]].y - (wlx[sel[0]][0] * carobj[sel[0]].mat[1]) - (wly[sel[0]][0] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[9]));
        whl[sel[0]][0].z = (carobj[sel[0]].z - (wlx[sel[0]][0] * carobj[sel[0]].mat[2]) - (wly[sel[0]][0] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[10]));
        whl[sel[0]][0].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[sel[0]][0].mat[k] = carobj[sel[0]].mat[k];
        }
        mat4.rotate(whl[sel[0]][0].mat, whl[sel[0]][0].mat, (90 * (Math.PI / 180)), [0, 1, 0]);
        whl[sel[0]][1].x = (carobj[sel[0]].x + (wlx[sel[0]][0] * carobj[sel[0]].mat[0]) - (wly[sel[0]][0] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[8]));
        whl[sel[0]][1].y = (carobj[sel[0]].y + (wlx[sel[0]][0] * carobj[sel[0]].mat[1]) - (wly[sel[0]][0] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[9]));
        whl[sel[0]][1].z = (carobj[sel[0]].z + (wlx[sel[0]][0] * carobj[sel[0]].mat[2]) - (wly[sel[0]][0] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][0] * carobj[sel[0]].mat[10]));
        whl[sel[0]][1].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[sel[0]][1].mat[k] = carobj[sel[0]].mat[k];
        }
        mat4.rotate(whl[sel[0]][1].mat, whl[sel[0]][1].mat, (-90 * (Math.PI / 180)), [0, 1, 0]);
        whl[sel[0]][2].x = (carobj[sel[0]].x - (wlx[sel[0]][1] * carobj[sel[0]].mat[0]) - (wly[sel[0]][1] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[8]));
        whl[sel[0]][2].y = (carobj[sel[0]].y - (wlx[sel[0]][1] * carobj[sel[0]].mat[1]) - (wly[sel[0]][1] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[9]));
        whl[sel[0]][2].z = (carobj[sel[0]].z - (wlx[sel[0]][1] * carobj[sel[0]].mat[2]) - (wly[sel[0]][1] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[10]));
        whl[sel[0]][2].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[sel[0]][2].mat[k] = carobj[sel[0]].mat[k];
        }
        mat4.rotate(whl[sel[0]][2].mat, whl[sel[0]][2].mat, (90 * (Math.PI / 180)), [0, 1, 0]);
        whl[sel[0]][3].x = (carobj[sel[0]].x + (wlx[sel[0]][1] * carobj[sel[0]].mat[0]) - (wly[sel[0]][1] * carobj[sel[0]].mat[4]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[8]));
        whl[sel[0]][3].y = (carobj[sel[0]].y + (wlx[sel[0]][1] * carobj[sel[0]].mat[1]) - (wly[sel[0]][1] * carobj[sel[0]].mat[5]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[9]));
        whl[sel[0]][3].z = (carobj[sel[0]].z + (wlx[sel[0]][1] * carobj[sel[0]].mat[2]) - (wly[sel[0]][1] * carobj[sel[0]].mat[6]) + (wlz[sel[0]][1] * carobj[sel[0]].mat[10]));
        whl[sel[0]][3].mat = mat4.create();
        for (var k = 0; k < 12; k++) {
            whl[sel[0]][3].mat[k] = carobj[sel[0]].mat[k];
        }
        mat4.rotate(whl[sel[0]][3].mat, whl[sel[0]][3].mat, (-90 * (Math.PI / 180)), [0, 1, 0]);
        bgst.mat = mat4.create();
        mat4.rotate(bgst.mat, bgst.mat, (camxz * (Math.PI / 180)), [0, -1, 0]);
        mat4.rotate(bgst.mat, bgst.mat, (camzy * (Math.PI / 180)), [-1, 0, 0]);
        bgst.mat[0] *= (aspect * 0.5625);
        bgst.mat[1] *= (aspect * 0.5625);
        bgst.mat[2] *= (aspect * 0.5625);
        bgst.x = 0;
        bgst.y = 0;
        bgst.z = -90;
        mat4.rotate(cmat, cmat, (camzy * (Math.PI / 180)), [1, 0, 0]);
        mat4.rotate(cmat, cmat, (camxz * (Math.PI / 180)), [0, 1, 0]);
        updateframe = true;
    }
}
function render(now) {
    if (fase == 7 || fase == 8 || fase == 9 || fase == 10) {
        if (updateframe) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.DEPTH_TEST);
            drawrad3D(ground);
            drawrad3D(skydom);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            for (var i = 0; i < nb; i++) {
                if (obo[i].iscp) {
                    if (((oncheckpoint + 1) == obo[i].iscp) && (Math.round(chkflk) == 0 || chkflk == 1)) {
                        if (Math.round(chkflk) == 0) {
                            build[obo[i].typ].ownshade = true;
                        } else {
                            build[obo[i].typ].ownlight = true;
                        }
                    } else {
                        build[obo[i].typ].ownshade = false;
                        build[obo[i].typ].ownlight = false;
                    }
                }
                if (obo[i].typ == 29) {
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.FRONT);
                }
                build[obo[i].typ].x = obo[i].x;
                build[obo[i].typ].y = obo[i].y;
                build[obo[i].typ].z = obo[i].z;
                build[obo[i].typ].mat = obo[i].mat;
                drawrad3D(build[obo[i].typ]);
                if (obo[i].typ == 29) {
                    gl.disable(gl.CULL_FACE);
                }
            }
            for (var i = 0; i < nspr; i++) {
                if (sprk[i].stat != 0) {
                    spark[sprk[i].typ].x = sprk[i].x;
                    spark[sprk[i].typ].y = sprk[i].y;
                    spark[sprk[i].typ].z = sprk[i].z;
                    spark[sprk[i].typ].mat = sprk[i].mat;
                    drawparticle(spark[sprk[i].typ]);
                }
            }
            for (var c = 0; c < ncars; c++) {
                if (shad[car[c].typ].intershad) {
                    gl.disable(gl.DEPTH_TEST);
                }
                drawrad3D(shad[car[c].typ]);
                if (shad[car[c].typ].intershad) {
                    gl.enable(gl.DEPTH_TEST);
                }
            }
            for (var i = 0; i < nchp; i++) {
                drawrad3D(chip[i]);
            }
            if (oncheckpoint != -1) {
                drawparticle(cptext);
                if (onlastcheck) {
                    drawparticle(fntext);
                }
            }
            for (var c = 0; c < ncars; c++) {
                for (var w = 0; w < 4; w++) {
                    var k = 0;
                    if (w >= 2) {
                        k = 1;
                    }
                    if (whl[car[c].typ][w].dist < 250) {
                        tiren[car[c].typ][k].x = whl[car[c].typ][w].x;
                        tiren[car[c].typ][k].y = whl[car[c].typ][w].y;
                        tiren[car[c].typ][k].z = whl[car[c].typ][w].z;
                        tiren[car[c].typ][k].mat = whl[car[c].typ][w].mat;
                        drawparticle(tiren[car[c].typ][k]);
                    } else {
                        tirel[car[c].typ][k].x = whl[car[c].typ][w].x;
                        tirel[car[c].typ][k].y = whl[car[c].typ][w].y;
                        tirel[car[c].typ][k].z = whl[car[c].typ][w].z;
                        tirel[car[c].typ][k].mat = whl[car[c].typ][w].mat;
                        drawparticle(tirel[car[c].typ][k]);
                    }
                }
                carobj[car[c].typ].x = car[c].x;
                carobj[car[c].typ].y = car[c].y;
                carobj[car[c].typ].z = car[c].z;
                carobj[car[c].typ].mat = car[c].mat;
                drawrad3D(carobj[car[c].typ]);
                for (var w = 0; w < 4; w++) {
                    var k = 0;
                    if (w >= 2) {
                        k = 1;
                    }
                    tired[car[c].typ][k].x = whl[car[c].typ][w].x;
                    tired[car[c].typ][k].y = whl[car[c].typ][w].y;
                    tired[car[c].typ][k].z = whl[car[c].typ][w].z;
                    tired[car[c].typ][k].mat = whl[car[c].typ][w].mat;
                    drawrad3D(tired[car[c].typ][k]);
                }
            }
            if (onelec) {
                for (var c = 0; c < ncars; c++) {
                    if (car[c].fcnt) {
                        elec.x = car[c].x;
                        elec.y = car[c].y;
                        elec.z = car[c].z;
                        mat4.rotate(elec.mat, elec.mat, (Math.random() * 360 * (Math.PI / 180)), [0, 0, 1]);
                        drawrad3D(elec);
                    }
                }
            }
            for (var i = 0; i < nf; i++) {
                fixdisk.x = obo[fi[i]].x;
                fixdisk.y = obo[fi[i]].y;
                fixdisk.z = obo[fi[i]].z;
                fixdisk.mat = obo[fi[i]].mat;
                drawrad3D(fixdisk);
            }
            for (var i = 0; i < nexp; i++) {
                if (exp[ewer[i]].ani != -1) {
                    explode[exp[ewer[i]].typ].x = exp[ewer[i]].x;
                    explode[exp[ewer[i]].typ].y = exp[ewer[i]].y;
                    explode[exp[ewer[i]].typ].z = exp[ewer[i]].z;
                    explode[exp[ewer[i]].typ].ont = Math.floor(exp[ewer[i]].ani);
                    explode[exp[ewer[i]].typ].mat = exp[ewer[i]].mat;
                    drawrad3D(explode[exp[ewer[i]].typ]);
                }
            }
            for (var k = 0; k < ndst; k++) {
                var i = dwer[k];
                if (dust[i].stg != 0) {
                    sprite.x = dust[i].x;
                    sprite.y = dust[i].y;
                    sprite.z = dust[i].z;
                    sprite.mat = dust[i].mat;
                    sprite.texture = dtexture[dust[i].tx][Math.floor(dust[i].ta)];
                    drawrad3D(sprite);
                }
            }
            updateframe = false;
        }
        requestAnimationFrame(render);
    }
    if (fase == 2) {
        if (updateframe) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.DEPTH_TEST);
            drawrad3D(bg3D);
            for (var i = 0; i < 9; i++) {
                sprite.x = smoke[i].x;
                sprite.y = smoke[i].y;
                sprite.z = smoke[i].z;
                sprite.mat = smoke[i].mat;
                var ui = i;
                while (ui >= 3) {
                    ui -= 3;
                }
                sprite.texture = stexture[ui];
                drawrad3D(sprite);
            }
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            drawrad3D(shad[sel[0]]);
            for (var w = 0; w < 4; w++) {
                var k = 0;
                if (w >= 2) {
                    k = 1;
                }
                tiren[sel[0]][k].x = whl[sel[0]][w].x;
                tiren[sel[0]][k].y = whl[sel[0]][w].y;
                tiren[sel[0]][k].z = whl[sel[0]][w].z;
                tiren[sel[0]][k].mat = whl[sel[0]][w].mat;
                drawparticle(tiren[sel[0]][k]);
            }
            drawrad3D(carobj[sel[0]]);
            for (var w = 0; w < 4; w++) {
                var k = 0;
                if (w >= 2) {
                    k = 1;
                }
                tired[sel[0]][k].x = whl[sel[0]][w].x;
                tired[sel[0]][k].y = whl[sel[0]][w].y;
                tired[sel[0]][k].z = whl[sel[0]][w].z;
                tired[sel[0]][k].mat = whl[sel[0]][w].mat;
                drawrad3D(tired[sel[0]][k]);
            }
            updateframe = false;
        }
        requestAnimationFrame(render);
    }
    if (fase == 4) {
        if (updateframe) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.DEPTH_TEST);
            drawparticle(bgst);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            if (!flkun) {
                for (var i = 0; i < (cp.obi[(cp.n - 1)] + adod); i++) {
                    if (obo[i].iscp) {
                        if (Math.round(chkflk) == 0 || chkflk == 1) {
                            if (Math.round(chkflk) == 0) {
                                build[obo[i].typ].ownshade = true;
                            } else {
                                build[obo[i].typ].ownlight = true;
                            }
                        } else {
                            build[obo[i].typ].ownshade = false;
                            build[obo[i].typ].ownlight = false;
                        }
                    }
                    build[obo[i].typ].x = obo[i].x;
                    build[obo[i].typ].y = obo[i].y;
                    build[obo[i].typ].z = obo[i].z;
                    build[obo[i].typ].mat = obo[i].mat;
                    drawrad3D(build[obo[i].typ]);
                }
                for (var i = 0; i < nf; i++) {
                    fixdisk.x = obo[fi[i]].x;
                    fixdisk.y = obo[fi[i]].y;
                    fixdisk.z = obo[fi[i]].z;
                    fixdisk.mat = obo[fi[i]].mat;
                    drawrad3D(fixdisk);
                }
            }
            updateframe = false;
        }
        requestAnimationFrame(render);
    }
    if ((fase == 12) && (fredo == 76)) {
        if (updateframe) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.DEPTH_TEST);
            drawparticle(bgst);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            for (var w = 0; w < 4; w++) {
                var k = 0;
                if (w >= 2) {
                    k = 1;
                }
                tiren[sel[0]][k].x = whl[sel[0]][w].x;
                tiren[sel[0]][k].y = whl[sel[0]][w].y;
                tiren[sel[0]][k].z = whl[sel[0]][w].z;
                tiren[sel[0]][k].mat = whl[sel[0]][w].mat;
                drawparticle(tiren[sel[0]][k]);
            }
            drawrad3D(carobj[sel[0]]);
            for (var w = 0; w < 4; w++) {
                var k = 0;
                if (w >= 2) {
                    k = 1;
                }
                tired[sel[0]][k].x = whl[sel[0]][w].x;
                tired[sel[0]][k].y = whl[sel[0]][w].y;
                tired[sel[0]][k].z = whl[sel[0]][w].z;
                tired[sel[0]][k].mat = whl[sel[0]][w].mat;
                drawrad3D(tired[sel[0]][k]);
            }
            updateframe = false;
        }
        requestAnimationFrame(render);
    }
}
function newcontrol() {
    return {
        up: false,
        down: false,
        left: false,
        right: false,
        handb: false,
        arrace: false,
        zyinv: false
    };
}
var u = [];
for (var i = 0; i < 7; i++) {
    u[i] = newcontrol();
}
class CarDefine {
    swits = [[50, 185, 282], [100, 200, 310], [60, 180, 275], [76, 195, 298], [70, 170, 275], [70, 202, 293], [60, 170, 289], [40, 160, 260], [70, 206, 291], [60, 140, 275], [90, 210, 295], [70, 201, 294], [90, 190, 276], [70, 200, 295], [50, 160, 270], [90, 200, 305], [50, 130, 210], [80, 200, 300], [70, 210, 290]];
    acelf = [[11, 5, 3], [14, 7, 5], [10, 5, 3.5], [11, 6, 3.5], [10, 5, 3.5], [12, 6, 3], [7, 9, 4], [9, 7, 3], [11, 5, 3], [8, 4.5, 3], [12, 7, 4], [11.5, 6, 3], [12, 7, 3.5], [11.5, 6.5, 3.5], [9, 5, 3], [13, 7, 4.5], [7.5, 3.5, 3], [11, 7.5, 4], [12, 6, 3.5]];
    handb = [7, 10, 7, 15, 12, 8, 9, 11, 10, 13, 5, 7, 7, 8, 10, 8, 12, 7, 7];
    airs = [1, 1.2, 0.95, 1, 2.2, 1, 0.9, 1.1, 0.8, 0.6, 1, 1.1, 0.9, 1.15, 0.8, 1, 0.3, 1.3, 1];
    airc = [70, 30, 40, 40, 30, 50, 40, 20, 90, 30, 40, 65, 50, 75, 10, 50, 0, 100, 60];
    turn = [6, 9, 5, 7, 8, 7, 5, 7, 5, 4, 9, 7, 7, 7, 4, 6, 5, 7, 6, 0];
    grip = [20, 27, 18, 22, 19, 20, 25, 26, 20, 22, 19, 23, 24, 22.5, 25, 30, 27, 25, 27];
    bounce = [1.2, 1.05, 1.3, 1.15, 1.3, 1.2, 1.15, 1, 1.1, 0.9, 1.2, 1.2, 1.1, 1.15, 0.8, 1.05, 0.8, 1.1, 1.15];
    boundr = [7, 6, 9, 10, 7, 9, 6, 9, 10, 8, 8, 7, 11, 7, 7, 7, 14, 6, 7];
    simag = [0.9, 0.85, 1.05, 0.9, 0.85, 0.9, 1.05, 1.2, 0.9, 1.1, 1, 0.9, 1.05, 0.9, 1.1, 0.9, 1.3, 0.9, 1.15];
    moment = [1.2, 0.75, 1.4, 1, 0.85, 1.25, 1.4, 1.4, 1.3, 1.6, 1.2, 1.3, 1.5, 1.375, 2, 1.2, 3, 1.5, 2];
    comprad = [0.5, 0.4, 0.8, 0.5, 0.4, 0.5, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.8, 0.5, 1.5, 0.5, 1.2, 0.5, 0.8];
    push = [2, 2, 3, 3, 2, 2, 2, 3, 4, 3, 2, 2, 2, 2, 4, 2, 2, 2, 2];
    revpush = [2, 3, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 2, 1];
    lift = [0, 30, 0, 20, 0, 30, 0, 10, 0, 0, 20, 0, 0, 0, 0, 10, 0, 30, 0];
    revlift = [0, 0, 15, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32];
    powerloss = [2500000, 2500000, 3500000, 2500000, 4000000, 2500000, 3200000, 3700000, 3200000, 3300000, 2750000, 2600000, 5500000, 2750000, 4500000, 3500000, 16700000, 3000000, 5500000];
    flipy = [-50, -60, -92, -44, -60, -57, -54, -120, -60, -140, -77, -82, -57, -82, -85, -28, -100, -63, -127];
    msquash = [7, 4, 7, 2, 8, 4, 6, 14, 4, 7, 3, 4, 8, 4, 10, 3, 20, 3, 8];
    clrad = [3600, 1700, 4700, 3000, 2000, 4500, 3500, 3500, 5000, 8500, 10000, 6000, 15000, 4000, 7000, 10000, 22000, 5500, 5000];
    dammult = [0.75, 0.8, 0.45, 0.8, 0.42, 0.7, 0.72, 0.65, 0.6, 0.5, 0.58, 0.6, 0.41, 0.67, 0.45, 0.61, 0.25, 0.38, 0.52];
    maxmag = [7600, 4200, 7200, 6000, 6000, 15000, 17200, 16000, 17000, 17000, 18000, 19000, 11000, 19000, 10700, 13000, 45000, 5800, 18000];
    dishandle = [0.65, 0.6, 0.55, 0.77, 0.62, 0.9, 0.6, 0.5, 0.72, 0.6, 0.45, 0.95, 0.8, 0.95, 0.4, 0.87, 0.42, 1, 0.95];
    outdam = [0.68, 0.35, 0.80, 0.5, 0.42, 0.76, 0.82, 0.87, 0.76, 0.84, 0.72, 0.78, 0.62, 0.79, 0.95, 0.77, 1, 0.85, 1];
    names = ["Tornado Shark", "Formula 7", "Wow Caninaro", "La Vita Crab", "Nimi", "MAX Revenge", "Lead Oxide", "Tragdor", "Kool Kat", "Ice Cream", "Drifter X", "Shadow Rider", "Sword of Justice", "High Rider", "EL KING", "Mighty Eight", "M A S H E E N", "Radical One", "DR Monstaa"];
    colrdammult = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    engrev = [1, 0.85, 1.05, 0.85, 0.9, 1.1, 0.75, 0.8, 1, 0.8, 0.65, 0.9, 0.75, 1.35, 0.7, 1.2, 0.3, 1.4, 0.75];
    constructor() {
        for (var i = 0; i < 19; i++) {
            for (var k = 0; k < 3; k++) {
                this.swits[i][k] = (this.swits[i][k] / 10);
                this.acelf[i][k] = (this.acelf[i][k] / 10);
            }
            this.handb[i] = (this.handb[i] / 10);
            this.airc[i] = (this.airc[i] / 10);
            this.grip[i] = (this.grip[i] / 10);
            this.lift[i] = (this.lift[i] / 10);
            this.revlift[i] = (this.revlift[i] / 10);
            this.flipy[i] =  - (this.flipy[i] / 10);
            this.msquash[i] = (this.msquash[i] / 10);
            this.clrad[i] = (this.clrad[i] / 100);
            this.maxmag[i] = (this.maxmag[i] / 10);
        }
    }
}
var cd = new CarDefine();
class CheckPoints {
    x = [];
    y = [];
    z = [];
    typ = [];
    obi = [];
    pcs = 0;
    nsp = 0;
    n = 0;
    obn = [];
    fx = [];
    fy = [];
    fz = [];
    roted = [];
    special = [];
    fn = 0;
    stage = 16;
    nlaps = 0;
    nfix = 0;
    notb = false;
    name = "hogan rewish";
    pos = [6, 6, 6, 6, 6, 6, 6];
    clear = [0, 0, 0, 0, 0, 0, 0];
    dested = [0, 0, 0, 0, 0, 0, 0];
    magperc = [0, 0, 0, 0, 0, 0, 0];
    wasted = 0;
    haltall = false;
    pcleared = 0;
    insih() {
        this.pos = [6, 6, 6, 6, 6, 6, 6];
        this.clear = [0, 0, 0, 0, 0, 0, 0];
        this.dested = [0, 0, 0, 0, 0, 0, 0];
        this.magperc = [0, 0, 0, 0, 0, 0, 0];
        this.wasted = 0;
        this.haltall = false;
        this.pcleared = 0;
    }
}
var cp = new CheckPoints();
var secar = 0;
function checkstat() {
    if (!cp.haltall) {
        for (var i = 0; i < ncars; i++) {
            cp.magperc[i] = (hitmag[i] / cd.maxmag[car[i].typ]);
            if (cp.magperc[i] > 1) {
                cp.magperc[i] = 1;
            }
            cp.pos[i] = 0;
            if (cp.dested[i] == 0) {
                cp.clear[i] = clear[i];
            } else {
                cp.clear[i] = -1;
            }
        }
        for (var i = 0; i < ncars; i++) {
            for (var j = (i + 1); j < ncars; j++) {
                if (cp.clear[i] != cp.clear[j]) {
                    if (cp.clear[i] < cp.clear[j]) {
                        cp.pos[i]++;
                    } else {
                        cp.pos[j]++;
                    }
                } else {
                    var ic = (pcleared[i] + 1);
                    if (ic >= cp.n) {
                        ic = 0;
                    }
                    while (cp.typ[ic] <= 0) {
                        ic++;
                        if (ic >= cp.n) {
                            ic = 0;
                        }
                    }
                    if (pyo((car[i].x / 10), (cp.x[ic] / 10), (car[i].z / 10), (cp.z[ic] / 10)) > pyo((car[j].x / 10), (cp.x[ic] / 10), (car[j].z / 10), (cp.z[ic] / 10))) {
                        cp.pos[i]++;
                    } else {
                        cp.pos[j]++;
                    }
                }
            }
        }
        if (cp.stage > 2) {
            for (var i = 0; i < ncars; i++) {
                if ((cp.clear[i] == (cp.nlaps * cp.nsp)) && (cp.pos[i] == 0)) {
                    if (i == 0) {
                        for (var j = 0; j < ncars; j++) {
                            if (cp.pos[j] == 1) {
                                secar = j;
                            }
                        }
                        if ((pyo((car[0].x / 10), (car[secar].x / 10), (car[0].z / 10), (car[secar].z / 10)) < 14000) && ((cp.clear[0] - clear[secar]) == 1)) {
                            catchfin = 43;
                        }
                    } else {
                        if ((cp.pos[0] == 1) && (pyo((car[0].x / 10), (car[i].x / 10), (car[0].z / 10), (car[i].z / 10)) < 14000) && ((clear[i] - clear[0]) == 1)) {
                            catchfin = 43;
                            secar = i;
                        }
                    }
                }
            }
        }
    }
    cp.wasted = 0;
    for (var i = 0; i < ncars; i++) {
        if (im != i) {
            if (dest[i]) {
                cp.wasted++;
            }
        }
    }
    if (catchfin != 0) {
        catchfin--;
        if (catchfin == 0) {
            catchnow((4 + cp.pos[0]));
            if (htyp == (4 + cp.pos[0])) {
                hscar = secar;
                if (htyp > 5) {
                    htyp = 5;
                }
            }
        }
    }
}
var xstart = [0, -35, 35, 0, -35, 35, 0];
var zstart = [-76, -38, -38, 0, 38, 38, 76];
function newcar() {
    return {
        typ: 0,
        x: 0,
        y: 0,
        z: 0,
        xy: 0,
        xz: 0,
        zy: 0,
        mat: null,
        grat: 0,
        keyx: [],
        keyz: [],
        wzy: 0,
        wxz: 0,
        ctxl: [],
        fcnt: 0
    };
}
var car = [];
for (var i = 0; i < 7; i++) {
    car[i] = newcar();
}
function inishcars() {
    for (var i = 0; i < ncars; i++) {
        car[i].typ = sel[i];
        car[i].x = (xstart[i] + (4 * Math.random()) - 2);
        car[i].z = zstart[i];
        car[i].grat = (wly[car[i].typ][1] + (1.5 * wlh[car[i].typ][1]));
        car[i].y = car[i].grat;
        car[i].xy = 0;
        car[i].xz = 0;
        car[i].zy = 0;
        car[i].wzy = 0;
        car[i].wxz = 0;
        car[i].keyx[0] = -wlx[car[i].typ][0];
        car[i].keyz[0] = wlz[car[i].typ][0];
        car[i].keyx[1] = wlx[car[i].typ][0];
        car[i].keyz[1] = wlz[car[i].typ][0];
        car[i].keyx[2] = -wlx[car[i].typ][1];
        car[i].keyz[2] = wlz[car[i].typ][1];
        car[i].keyx[3] = wlx[car[i].typ][1];
        car[i].keyz[3] = wlz[car[i].typ][1];
        car[i].mat = mat4.create();
        car[i].ctxl[0] = Math.random();
        car[i].ctxl[1] = Math.random();
        car[i].fcnt = 0;
    }
}
function sortcars(stage) {
    ncars = 7;
    for (var i = 1; i < 7; i++) {
        sel[i] = -1;
    }
    var oks = [];
    var ti = ncars;
    if ((sel[0] != Math.floor(10 + ((stage + 1) / 2))) && (stage != 17)) {
        sel[(ncars - 1)] = Math.floor(10 + ((stage + 1) / 2));
        ti = (ncars - 1);
    }
    for (var i = 1; i < ti; i++) {
        oks[i] = false;
        while (!oks[i]) {
            sel[i] = Math.floor(Math.random() * (28 + (10 * (stage / 17))));
            if (sel[i] >= 19) {
                sel[i] -= 19;
            }
            if (sel[i] == 19) {
                sel[i] = 18;
            }
            oks[i] = true;
            for (var j = 0; j < ncars; j++) {
                if ((i != j) && (sel[i] == sel[j])) {
                    oks[i] = false;
                }
            }
            if ((stage != 15) && (stage != 16)) {
                var outproba = (((18 - sel[i]) / 18) * (stage / 16));
                if (outproba > 0.8) {
                    outproba = 0.8;
                }
                if (stage == 17) {
                    if (outproba > 0.5) {
                        outproba = 0.5;
                    }
                }
                if (outproba > Math.random()) {
                    oks[i] = false;
                }
            }
            if (((sel[i] - 10) * 2) > unlocked) {
                oks[i] = false;
            }
            if ((stage == 6) && (unlocked == 6) && (sel[i] == 2 || sel[i] == 4 || sel[i] == 6 || sel[i] == 9)) {
                oks[i] = false;
            }
            if ((stage == 8) && (unlocked == 8) && (sel[i] == 4 || sel[i] == 6 || sel[i] == 9)) {
                if (Math.random() > Math.random()) {
                    oks[i] = false;
                }
            }
            if ((stage == 9) && (unlocked == 9) && (sel[i] == 4 || sel[i] == 3 || sel[i] == 0 || sel[i] == 2)) {
                if (Math.random() > Math.random()) {
                    oks[i] = false;
                }
            }
            if ((stage == 10) && (unlocked == 10) && (sel[i] == 2 || sel[i] == 6 || sel[i] == 9 || sel[i] == 14)) {
                if (Math.random() > Math.random()) {
                    oks[i] = false;
                }
            }
            if ((stage == 11) && (unlocked == 11) && (sel[i] == 0 || sel[i] == 1 || sel[i] == 2 || sel[i] == 3 || sel[i] == 4 || sel[i] == 14)) {
                oks[i] = false;
            }
            if ((stage == 12) && (unlocked == 12) && (sel[i] <= 4)) {
                oks[i] = false;
            }
            if ((stage == 13) && (unlocked == 13)) {
                if (sel[i] <= 4) {
                    oks[i] = false;
                }
                if (sel[i] == 14 || sel[i] == 16) {
                    if (Math.random() > Math.random()) {
                        oks[i] = false;
                    }
                }
            }
            if ((stage == 14) && (unlocked == 14) && (sel[i] == 0 || sel[i] == 2 || sel[i] == 3 || sel[i] == 4 || sel[i] == 6 || sel[i] == 9 || sel[i] == 14 || sel[i] == 16)) {
                oks[i] = false;
            }
            if ((stage == 15) && (unlocked == 15)) {
                if (sel[i] < 5) {
                    oks[i] = false;
                }
                if (sel[i] < 11) {
                    if (Math.random() > 0.1) {
                        oks[i] = false;
                    }
                }
            }
            if ((stage == 16) && (unlocked == 16)) {
                if (sel[i] < 11) {
                    oks[i] = false;
                }
            }
        }
    }
    if ((stage == 6) && (unlocked == 6)) {
        var okcar = false;
        for (var i = 0; i < 7; i++) {
            if (sel[i] == 11) {
                okcar = true;
            }
        }
        if (!okcar) {
            var ssel = 18;
            var ssi = 1;
            for (var i = 1; i < ti; i++) {
                if (sel[i] < ssel) {
                    ssel = sel[i];
                    ssi = i;
                }
            }
            sel[ssi] = 11;
        }
    }
    if ((stage == 12) && (unlocked == 12)) {
        var okcar = false;
        for (var i = 0; i < 7; i++) {
            if (sel[i] == 14) {
                okcar = true;
            }
        }
        if (!okcar) {
            var ssi = Math.floor(1 + (5 * Math.random()));
            if (ssi == 6) {
                ssi = 5;
            }
            sel[ssi] = 14;
        }
    }
    if ((stage == 16) && (unlocked == 16)) {
        var okcar = false;
        for (var i = 0; i < 7; i++) {
            if (sel[i] == 16) {
                okcar = true;
            }
        }
        if (!okcar) {
            var ssi = Math.floor(1 + (5 * Math.random()));
            if (ssi == 6) {
                ssi = 5;
            }
            sel[ssi] = 16;
        }
        var tk = 1;
        if (Math.random() > Math.random()) {
            tk = 2;
        }
        for (var i = 3; i < 6; i++) {
            if (sel[i] == 16) {
                sel[i] = sel[tk];
                sel[tk] = 16;
            }
        }
        if (tk == 1) {
            tk = 2;
        } else {
            tk = 1;
        }
        for (var i = 3; i < 6; i++) {
            if (sel[i] == 14) {
                sel[i] = sel[tk];
                sel[tk] = 14;
            }
        }
        tk = 4;
        if (Math.random() > Math.random()) {
            tk = 5;
        }
        for (var i = 1; i < 4; i++) {
            if (sel[i] == 15) {
                sel[i] = sel[tk];
                sel[tk] = 15;
            }
        }
    }
}
var fpnt = [0, 0, 0, 0, 0];
var pan = [0, 0, 0, 0, 0, 0, 0];
var attack = [0, 0, 0, 0, 0, 0, 0], acr = [0, 0, 0, 0, 0, 0, 0];
var afta = [false, false, false, false, false, false, false];
var trfix = [0, 0, 0, 0, 0, 0, 0];
var forget = [false, false, false, false, false, false, false];
var bulistc = [false, false, false, false, false, false, false];
var runbul = [0, 0, 0, 0, 0, 0, 0];
var acuracy = [0, 0, 0, 0, 0, 0, 0];
var upwait = [0, 0, 0, 0, 0, 0, 0];
var agressed = [false, false, false, false, false, false, false];
var skiplev = [1, 1, 1, 1, 1, 1, 1];
var clrnce = [5, 5, 5, 5, 5, 5, 5];
var rampp = [0, 0, 0, 0, 0, 0, 0];
var turntyp = [0, 0, 0, 0, 0, 0, 0];
var aim = [0, 0, 0, 0, 0, 0, 0];
var saftey = [30, 30, 30, 30, 30, 30, 30];
var perfection = [false, false, false, false, false, false, false];
var mustland = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
var usebounce = [false, false, false, false, false, false, false];
var trickprf = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
var stuntf = [0, 0, 0, 0, 0, 0, 0];
var lastl = [false, false, false, false, false, false, false], wlastl = [false, false, false, false, false, false, false];
var hold = [0, 0, 0, 0, 0, 0, 0], wall = [-1, -1, -1, -1, -1, -1, -1], lwall = [-1, -1, -1, -1, -1, -1, -1];
var stcnt = [0, 0, 0, 0, 0, 0, 0], statusque = [0, 0, 0, 0, 0, 0, 0];
var turncnt = [0, 0, 0, 0, 0, 0, 0], randtcnt = [0, 0, 0, 0, 0, 0, 0];
var upcnt = [0, 0, 0, 0, 0, 0, 0];
var trickfase = [0, 0, 0, 0, 0, 0, 0], swat = [0, 0, 0, 0, 0, 0, 0];
var udcomp = [false, false, false, false, false, false, false], lrcomp = [false, false, false, false, false, false, false], udbare = [false, false, false, false, false, false, false], lrbare = [false, false, false, false, false, false, false];
var onceu = [false, false, false, false, false, false, false], onced = [false, false, false, false, false, false, false], oncel = [false, false, false, false, false, false, false], oncer = [false, false, false, false, false, false, false];
var lrdirect = [0, 0, 0, 0, 0, 0, 0], uddirect = [0, 0, 0, 0, 0, 0, 0], lrstart = [0, 0, 0, 0, 0, 0, 0], udstart = [0, 0, 0, 0, 0, 0, 0], oxy = [0, 0, 0, 0, 0, 0, 0], ozy = [0, 0, 0, 0, 0, 0, 0], flycnt = [0, 0, 0, 0, 0, 0, 0];
var lrswt = [false, false, false, false, false, false, false], udswt = [false, false, false, false, false, false, false], gowait = [false, false, false, false, false, false, false];
var actwait = [0, 0, 0, 0, 0, 0, 0], cntrn = [0, 0, 0, 0, 0, 0, 0];
var revstart = [0, 0, 0, 0, 0, 0, 0], oupnt = [0, 0, 0, 0, 0, 0, 0];
var wtz = [0, 0, 0, 0, 0, 0, 0], wtx = [0, 0, 0, 0, 0, 0, 0], frx = [0, 0, 0, 0, 0, 0, 0], frz = [0, 0, 0, 0, 0, 0, 0], frad = [0, 0, 0, 0, 0, 0, 0];
var apunch = [0, 0, 0, 0, 0, 0, 0];
var exitattack = [false, false, false, false, false, false, false];
var avoidnlev = [0, 0, 0, 0, 0, 0, 0];
function inishcontrol() {
    if (cp.stage != 9) {
        for (var j = 0; j < nf; j++) {
            var pyclos = -10;
            for (var i = 0; i < cp.n; i++) {
                if ((pyo((obo[fi[j]].x / 10), (cp.x[i] / 10), (obo[fi[j]].z / 10), (cp.z[i] / 10)) < pyclos) || (pyclos == -10)) {
                    pyclos = pyo((obo[fi[j]].x / 10), (cp.x[i] / 10), (obo[fi[j]].z / 10), (cp.z[i] / 10));
                    fpnt[j] = i;
                }
            }
        }
        for (var i = 0; i < nf; i++) {
            fpnt[i] -= 4;
            if (fpnt[i] < 0) {
                fpnt[i] += cp.nsp;
            }
            if ((cp.stage == 15) && (i == 2)) {
                fpnt[i] = 71;
            }
        }
    } else {
        if (cp.stage == 9) {
            fpnt[1] = 36;
            fpnt[0] = 42;
        }
    }
    for (var c = 1; c < 7; c++) {
        pan[c] = 0;
        attack[c] = 0;
        acr[c] = 0;
        afta[c] = false;
        trfix[c] = 0;
        acuracy[c] = 0;
        upwait[c] = 0;
        forget[c] = false;
        bulistc[c] = false;
        runbul[c] = 0;
        revstart[c] = 0;
        oupnt[c] = 0;
        gowait[c] = false;
        apunch[c] = 0;
        exitattack[c] = false;
        hold[c] = 0;
        if (cp.stage == 6) {
            hold[c] = 50;
        }
        if (cp.stage == 7) {
            hold[c] = 10;
        }
        if ((cp.stage == 8) && (c != 6)) {
            hold[c] = 50;
        }
        if (cp.stage == 10) {
            hold[c] = 60;
        }
        if (cp.stage == 11) {
            if (c != 6) {
                hold[c] = 35;
                revstart[c] = 25;
            } else {
                hold[c] = 5;
            }
            statusque[c] = 0;
        }
        if (cp.stage == 12) {
            if (c != 6) {
                hold[c] = Math.floor(20 + (10 * Math.random()));
                revstart[c] = Math.floor(10 + (10 * Math.random()));
            } else {
                hold[c] = 5;
            }
            statusque[c] = 0;
        }
        if (cp.stage == 14) {
            hold[c] = 30;
            statusque[c] = 0;
            if (c != 6) {
                revstart[c] = 1;
            }
        }
        if (cp.stage == 15) {
            hold[c] = 40;
        }
        if (cp.stage == 16) {
            hold[c] = 20;
        }
        u[c].left = false;
        u[c].right = false;
        u[c].up = false;
        u[c].down = false;
        u[c].handb = false;
    }
}
function control() {
    for (var c = 1; c < ncars; c++) {
        var cn = car[c].typ;
        u[c].left = false;
        u[c].right = false;
        u[c].up = false;
        u[c].down = false;
        u[c].handb = false;
        if (!dest[c]) {
            if (mtouch[c]) {
                if (stcnt[c] > statusque[c]) {
                    var tstage = cp.stage;
                    acuracy[c] = Math.floor((7 - cp.pos[c]) * (cp.pos[0]) * (6 - (tstage * 2)));
                    if (acuracy[c] < 0) {
                        acuracy[c] = 0;
                    }
                    clrnce[c] = 5;
                    if (cp.stage == 6 || cp.stage == 11) {
                        clrnce[c] = 2;
                    }
                    if (cp.stage == 12) {
                        if (pcleared[c] == 27 || pcleared[c] == 17) {
                            clrnce[c] = 3;
                        }
                    }
                    if (cp.stage == 16) {
                        clrnce[c] = 3;
                    }
                    var mw = 0;
                    if (cp.stage == 1) {
                        mw = 2;
                    }
                    if (cp.stage == 2) {
                        mw = 1.5;
                    }
                    if ((cp.stage == 3) && (cn != 12)) {
                        mw = 0.5;
                    }
                    if (cp.stage == 4) {
                        mw = 0.5;
                    }
                    upwait[c] = Math.floor((cp.pos[0] - cp.pos[c]) * (cp.pos[0] - cp.pos[c]) * (cp.pos[0] - cp.pos[c]) * mw);
                    if (upwait[c] > 80) {
                        upwait[c] = 80;
                    }
                    if (cp.stage == 1) {
                        if (upwait[c] < 20) {
                            upwait[c] = 20;
                        }
                    }
                    mw = 0;
                    if (cp.stage == 1 || cp.stage == 2) {
                        mw = 1;
                    }
                    if (cp.stage == 3) {
                        mw = 0.5;
                    }
                    if (cp.stage == 4) {
                        mw = 0.5;
                    }
                    if (cp.stage == 5) {
                        mw = 0.2;
                    }
                    if ((cp.pos[c] - cp.pos[0]) >= -1) {
                        skiplev[c] -= 0.1;
                        if (skiplev[c] < 0) {
                            skiplev[c] = 0;
                        }
                    } else {
                        skiplev[c] += 0.2;
                        if (skiplev[c] > mw) {
                            skiplev[c] = mw;
                        }
                    }
                    if (cp.stage == 9 || cp.stage == 12) {
                        skiplev[c] = 1;
                    }
                    if (cp.stage == 11) {
                        skiplev[c] = 0;
                        if (pcleared[c] == 89 || pcleared[c] == 18) {
                            skiplev[c] = 1;
                        }
                        if (pcleared[c] == 45 || pcleared[c] == 52) {
                            skiplev[c] = 0.5;
                        }
                    }
                    if ((cp.stage == 13) && (pcleared[c] == 20)) {
                        skiplev[c] = 1;
                    }
                    if (cp.stage == 14) {
                        skiplev[c] = 1;
                        if (cn == 17) {
                            if (Math.random() > 0.8) {
                                acr[c] = 1;
                            } else {
                                acr[c] = 0;
                            }
                        }
                    }
                    if (cp.stage == 15) {
                        skiplev[c] = 0;
                    }
                    if (cp.stage == 16) {
                        if (pcleared[c] >= 45) {
                            skiplev[c] = 0;
                        } else {
                            skiplev[c] = 1;
                        }
                    }
                    rampp[c] = Math.floor((Math.random() * 4) - 2);
                    if (rampp[c] == 2) {
                        rampp[c] = 1;
                    }
                    if (power[c] == 98) {
                        rampp[c] = -1;
                    }
                    if ((power[c] < 75) && (rampp[c] == -1)) {
                        rampp[c] = 0;
                    }
                    if (power[c] < 60) {
                        rampp[c] = 1;
                    }
                    if (cp.stage == 11) {
                        if (pcleared[c] == 18) {
                            rampp[c] = 2;
                        }
                    }
                    if (cp.stage == 12) {
                        if (pcleared[c] == 17) {
                            rampp[c] = 2;
                        }
                    }
                    if (cp.stage == 15 || cp.stage == 16) {
                        rampp[c] = 0;
                    }
                    if (cntrn[c] == 0) {
                        agressed[c] = false;
                        turntyp[c] = Math.floor(Math.random() * 4);
                        if (turntyp[c] == 4) {
                            turntyp[c] = 3;
                        }
                        if ((cp.stage == 3) && (cn == 12)) {
                            turntyp[c] = 1;
                            if (attack[c] == 0) {
                                agressed[c] = true;
                            }
                        }
                        if (((cp.pos[0] - cp.pos[c]) < 0) || (cp.stage == 10)) {
                            turntyp[c] = Math.floor(Math.random() * 2);
                            if (turntyp[c] == 2) {
                                turntyp[c] = 1;
                            }
                        }
                        if (cp.stage == 11) {
                            if (pcleared[c] == 89) {
                                if (point[c] >= 5) {
                                    turntyp[c] = 2;
                                } else {
                                    turntyp[c] = 0;
                                }
                            }
                            if (pcleared[c] == 9) {
                                turntyp[c] = 2;
                            }
                        }
                        if (cp.stage == 13) {
                            if (pcleared[c] == 20 || pcleared[c] == 36 || pcleared[c] == 52) {
                                turntyp[c] = 1;
                            } else {
                                if (turntyp[c] == 3) {
                                    turntyp[c] = 1;
                                }
                            }
                        }
                        if (cp.stage == 14) {
                            turntyp[c] = 0;
                        }
                        if (attack[c] != 0) {
                            turntyp[c] = 2;
                            if (cp.stage == 9 || cp.stage == 11 || cp.stage == 13 || cp.stage == 16 || cp.stage == 17) {
                                turntyp[c] = Math.floor(Math.random() * 3);
                                if (turntyp[c] == 3) {
                                    turntyp[c] = 2;
                                }
                            }
                            if (cp.stage == 16) {
                                if (cn == 14) {
                                    turntyp[c] = 0;
                                }
                            }
                        }
                        if (cp.stage == 6 || cp.stage == 7 || cp.stage == 8 || cp.stage == 10 || cp.stage == 11 || cp.stage == 12 || cp.stage == 14 || cp.stage == 16 || cp.stage == 17) {
                            agressed[c] = true;
                        }
                        cntrn[c] = 5;
                    } else {
                        cntrn[c]--;
                    }
                    saftey[c] = Math.floor(((98 - power[c]) * 0.5) * ((Math.random() * 0.5) + 0.5));
                    if (saftey[c] > 20) {
                        saftey[c] = 20;
                    }
                    mw = 0;
                    if (cp.stage == 1) {
                        mw = 0.9;
                    }
                    if (cp.stage == 2) {
                        mw = 0.7;
                    }
                    if (cp.stage == 3) {
                        mw = 0.4;
                    }
                    mustland[c] = (mw + ((Math.random() / 2) - 0.25));
                    mw = 1;
                    if (cp.stage == 1) {
                        mw = 5;
                    }
                    if (cp.stage == 2) {
                        mw = 2;
                    }
                    if (cp.stage == 3) {
                        mw = 1.5;
                    }
                    if (power[c] > 50) {
                        if ((cp.pos[0] - cp.pos[c]) > 0) {
                            saftey[c] *= mw;
                        } else {
                            mustland[c] = 0;
                        }
                    } else {
                        mustland[c] -= 0.5;
                    }
                    if (cp.stage == 6) {
                        if (cn == 13) {
                            mustland[c] = 0;
                        }
                    }
                    if (cp.stage == 8 || cp.stage == 10 || cp.stage == 12 || cp.stage == 14 || cp.stage == 16) {
                        mustland[c] = 0;
                    }
                    stuntf[c] = 0;
                    if (cp.stage == 10) {
                        if (((cp.pos[c] - cp.pos[0]) > 1) || (Math.random() > Math.random())) {
                            stuntf[c] = 1;
                            saftey[c] = 10;
                        } else {
                            stuntf[c] = 2;
                        }
                    }
                    if ((cp.stage == 11) && (pcleared[c] == 18)) {
                        stuntf[c] = 2;
                    }
                    if ((cp.stage == 11) && (cn == 16)) {
                        stuntf[c] = 3;
                    }
                    if (cp.stage == 14) {
                        if (cn == 17) {
                            stuntf[c] = 4;
                            saftey[c] = 20;
                        } else {
                            saftey[c] = 10;
                            if (pcleared[c] == 47) {
                                stuntf[c] = 2;
                            }
                        }
                    }
                    if (cp.stage == 16) {
                        mustland[c] = 0;
                        saftey[c] = 20;
                        if (pcleared[c] == 152 || pcleared[c] == 20) {
                            stuntf[c] = 2;
                        }
                        if (pcleared[c] == 35) {
                            stuntf[c] = 1;
                        }
                        if (pcleared[c] == 112) {
                            stuntf[c] = 1;
                        }
                        if (pcleared[c] == 120) {
                            stuntf[c] = 2;
                        }
                        avoidnlev[c] = Math.floor(2700 * Math.random());
                    }
                    trickprf[c] = (((power[c] - 38) / 50) - (Math.random() * 0.5));
                    if (power[c] < 60) {
                        trickprf[c] = -1;
                    }
                    if ((cp.stage == 3) && (cn == 12)) {
                        if (trickprf[c] > 0.7) {
                            trickprf[c] = 0.7;
                        }
                    }
                    if ((cp.stage == 6) && (cn != 13)) {
                        if (trickprf[c] > 0.3) {
                            trickprf[c] = 0.3;
                        }
                    }
                    if (cp.stage == 8) {
                        if (trickprf[c] > 0.2) {
                            trickprf[c] = 0.2;
                        }
                    }
                    if (cp.stage == 11) {
                        if (trickprf[c] != -1) {
                            trickprf[c] *= 0.75;
                        }
                    }
                    if (cp.stage == 12) {
                        if (pcleared[c] == 55 || pcleared[c] == 7) {
                            trickprf[c] = -1;
                        }
                    }
                    if (cp.stage == 14) {
                        if (trickprf[c] > 0.5) {
                            trickprf[c] = 0.5;
                        }
                    }
                    if (cp.stage == 17) {
                        trickprf[c] = -1;
                    }
                    if (Math.random() > (power[c] / 100)) {
                        usebounce[c] = true;
                    } else {
                        usebounce[c] = false;
                    }
                    if (cp.stage == 4) {
                        usebounce[c] = true;
                    }
                    if (cp.stage == 6) {
                        if (cn == 13) {
                            usebounce[c] = false;
                        } else {
                            usebounce[c] = true;
                        }
                    }
                    if (cp.stage == 9 || cp.stage == 10 || cp.stage == 14) {
                        usebounce[c] = false;
                    }
                    if (Math.random() > (hitmag[c] / cd.maxmag[cn])) {
                        perfection[c] = false;
                    } else {
                        perfection[c] = true;
                    }
                    if ((100 * hitmag[c] / cd.maxmag[cn]) > 60) {
                        perfection[c] = true;
                    }
                    if ((cp.stage == 3) && (cn == 12)) {
                        perfection[c] = true;
                    }
                    if (cp.stage == 6 || cp.stage == 8 || cp.stage == 10 || cp.stage == 11 || cp.stage == 12 || cp.stage == 14 || cp.stage == 16 || cp.stage == 17) {
                        perfection[c] = true;
                    }
                    if ((cp.stage == 15) && (cn == 18)) {
                        perfection[c] = true;
                    }
                    if (attack[c] == 0) {
                        var startsway = true;
                        if (cp.stage == 3 || cp.stage == 1 || cp.stage == 4 || cp.stage == 9 || cp.stage == 13 || cp.stage == 16) {
                            startsway = afta[c];
                        }
                        if (cp.stage == 6 || cp.stage == 8 || cp.stage == 10 || cp.stage == 14) {
                            startsway = false;
                        }
                        var onlyou = false;
                        if ((cp.stage == 3) && (cn == 12)) {
                            onlyou = true;
                        }
                        if ((cp.stage == 8) && (cn == 14)) {
                            onlyou = true;
                        }
                        if ((cp.stage == 9) && (cp.clear[0] >= 8) && (cp.pos[0] == 0)) {
                            onlyou = true;
                        }
                        if (cp.stage == 11 || cp.stage == 12 || cp.stage == 13 || cp.stage == 15 || cp.stage == 16) {
                            onlyou = true;
                        }
                        var powtoattack = 60;
                        if (cp.stage == 3 || cp.stage == 17) {
                            powtoattack = 30;
                        }
                        if (cp.stage == 4) {
                            powtoattack = 20;
                        }
                        if ((cp.stage == 5) && (c != 6)) {
                            powtoattack = 40;
                        }
                        if ((cp.stage == 2 || cp.stage == 13) && (cn == 16)) {
                            powtoattack = 50;
                        }
                        if (cp.stage == 7) {
                            powtoattack = 40;
                        }
                        if ((cp.stage == 8) && (cn == 14)) {
                            powtoattack = 40;
                        }
                        if ((cp.stage == 9) && (onlyou)) {
                            powtoattack = 30;
                        }
                        if ((cp.stage == 11) && (bulistc[c])) {
                            powtoattack = 30;
                        }
                        if (cp.stage == 12) {
                            powtoattack = 50;
                        }
                        if ((cp.stage == 15) && (bulistc[c])) {
                            powtoattack = 40;
                        }
                        if (cp.stage == 16) {
                            if (cn == 14) {
                                powtoattack = 40;
                            }
                            if (cn == 16) {
                                powtoattack = 50;
                            }
                            if (cn == 18 || cn == 12) {
                                powtoattack = 50;
                            }
                            if (cp.pos[0] > cp.pos[c]) {
                                powtoattack = 80;
                            }
                        }
                        for (var i = 0; i < ncars; i++) {
                            if ((i != c) && (cp.clear[i] != -1)) {
                                var myxz = car[c].xz;
                                if (u[c].zyinv) {
                                    myxz += 180;
                                }
                                while (myxz < 0) {
                                    myxz += 360;
                                }
                                while (myxz > 180) {
                                    myxz -= 360;
                                }
                                var ad = 0;
                                if ((car[i].x - car[c].x) >= 0) {
                                    ad = 180;
                                }
                                var pnxz = (90 + ad + ((Math.atan(((car[i].z - car[c].z) / (car[i].x - car[c].x))) / 0.017453292519943295)));
                                while (pnxz < 0) {
                                    pnxz += 360;
                                }
                                while (pnxz > 180) {
                                    pnxz -= 360;
                                }
                                var vis = Math.abs(myxz - pnxz);
                                if (vis > 180) {
                                    vis = Math.abs(vis - 360);
                                }
                                var attackrad = (2000 * (Math.abs(cp.clear[i] - clear[c]) + 1));
                                if ((cp.stage == 3) && (cn == 12)) {
                                    if (attackrad < 12000) {
                                        attackrad = 12000;
                                    }
                                }
                                if (cp.stage == 4) {
                                    if (attackrad < 4000) {
                                        attackrad = 4000;
                                    }
                                }
                                if ((cp.stage == 8) && (cn == 14)) {
                                    if (attackrad < 12000) {
                                        attackrad = 12000;
                                    }
                                    vis = 10;
                                }
                                if (cp.stage == 9) {
                                    if ((onlyou) && (attackrad < 12000)) {
                                        attackrad = 12000;
                                    }
                                }
                                if (cp.stage == 11) {
                                    if (bulistc[c]) {
                                        attackrad = 8000;
                                        vis = 10;
                                        afta[c] = true;
                                    } else {
                                        if (attackrad < 6000) {
                                            attackrad = 6000;
                                        }
                                    }
                                }
                                if ((cp.stage == 12) && (bulistc[c])) {
                                    attackrad = 6000;
                                    vis = 10;
                                }
                                if (cp.stage == 13) {
                                    if (cp.clear[c] - cp.clear[0] > 3) {
                                        attackrad = 21000;
                                    }
                                }
                                if (cp.stage == 15) {
                                    attackrad *= (Math.abs(cp.clear[i] - clear[c]) + 1);
                                    if (bulistc[c]) {
                                        attackrad = (4000 * (Math.abs(cp.clear[i] - clear[c]) + 1));
                                        vis = 10;
                                    }
                                }
                                if (cp.stage == 16) {
                                    if (cn == 14) {
                                        attackrad = 16000;
                                        vis = 10;
                                    }
                                    if (cn == 16) {
                                        attackrad = 6000;
                                        vis = 10;
                                    }
                                    if (cn == 18 || cn == 12) {
                                        attackrad *= (Math.abs(cp.clear[i] - clear[c]) + 1);
                                    }
                                }
                                var visan = (85 + (15 * (Math.abs(cp.clear[i] - clear[c]) + 1)));
                                if ((cp.stage == 9) && (!onlyou)) {
                                    if ((car[0].typ != 14) || ((cp.clear[c] - cp.clear[0]) < 8)) {
                                        visan = 45;
                                    }
                                }
                                if (cp.stage == 13) {
                                    visan = 45;
                                }
                                if (cp.stage == 16) {
                                    if (cn == 18 || cn == 12 || cn == 17) {
                                        visan = (50 + (70 * Math.abs(cp.clear[i] - clear[c])));
                                    }
                                }
                                if ((vis < visan) && (pyo((car[c].x / 10), (car[i].x / 10), (car[c].z / 10), (car[i].z / 10)) < attackrad) && (afta[c]) && (power[c] > powtoattack)) {
                                    var bim = (35 - (Math.abs(cp.clear[i] - clear[c]) * 10));
                                    if (bim < 1) {
                                        bim = 1;
                                    }
                                    var atp = (((cp.pos[c] + 1) * (7 - cp.pos[i])) / bim);
                                    if (cp.stage != 17) {
                                        if (atp > 0.7) {
                                            atp = 0.7;
                                        }
                                    }
                                    if ((i != 0) && (cp.pos[0] < cp.pos[c])) {
                                        atp = 0;
                                    }
                                    if ((i != 0) && (onlyou)) {
                                        atp = 0;
                                    }
                                    if (cp.stage == 3) {
                                        if ((cn == 12) || ((cn == 16) && (bulistc[c]))) {
                                            atp *= 2;
                                        } else {
                                            atp *= 0.5;
                                        }
                                    }
                                    if ((cp.stage == 5) && (c == 6)) {
                                        atp *= 0.7;
                                    }
                                    if (cp.stage == 6) {
                                        atp = 0;
                                    }
                                    if ((cp.stage == 7) && (c == 6) && (i == 0)) {
                                        atp *= 1.5;
                                    }
                                    if (cp.stage == 8) {
                                        if ((bulistc[c]) && (i == 0)) {
                                            atp = 1;
                                        } else {
                                            atp = 0;
                                        }
                                    }
                                    if (cp.stage == 10) {
                                        atp = 0;
                                    }
                                    if (cp.stage == 11) {
                                        if ((bulistc[c]) && (i == 0)) {
                                            atp = 1;
                                        }
                                        if ((cp.pos[c] == 0) || ((cp.pos[c] == 1) && (cp.pos[0] == 0))) {
                                            atp = 0;
                                        }
                                    }
                                    if (cp.stage == 12) {
                                        if ((cn != 14) && (cn != 16)) {
                                            atp = 0;
                                        }
                                        if ((cn == 16 || cn == 14) && (i == 0)) {
                                            atp = 1;
                                        }
                                    }
                                    if (cp.stage == 14) {
                                        atp = 0;
                                    }
                                    if (cp.stage == 15) {
                                        if (cp.pos[c] == 0) {
                                            atp *= 0.5;
                                        }
                                        if (cp.pos[0] < cp.pos[c]) {
                                            atp *= 2;
                                        }
                                        if ((bulistc[c]) && (i == 0)) {
                                            atp = 1;
                                        }
                                    }
                                    if (cp.stage == 16) {
                                        if (cn != 17) {
                                            if (cp.pos[0] < cp.pos[c]) {
                                                if ((cp.clear[0] - cp.clear[c]) != 1) {
                                                    atp *= 2;
                                                }
                                            }
                                        } else {
                                            atp *= 0.5;
                                        }
                                        if ((cn == 14 || cn == 16) && (i == 0) && (bulistc[c])) {
                                            atp = 1;
                                        }
                                        if ((cp.pos[c] == 0) || ((cp.pos[c] == 1) && (cp.pos[0] == 0))) {
                                            atp = 0;
                                        }
                                        if (((cp.clear[c] - cp.clear[0]) >= 5) && (i == 0)) {
                                            atp = 1;
                                        }
                                        if (cn == 11 || cn == 13 || cn == 15) {
                                            atp = 0;
                                        }
                                    }
                                    if (Math.random() < atp) {
                                        attack[c] = (40 * (Math.abs(cp.clear[i] - clear[c]) + 1));
                                        if (attack[c] > 500) {
                                            attack[c] = 500;
                                        }
                                        aim[c] = 0;
                                        if ((cp.stage == 3) && (cn == 12)) {
                                            if (Math.random() > Math.random()) {
                                                aim[c] = 1;
                                            }
                                        }
                                        if (cp.stage == 4) {
                                            if ((i == 0) && (cp.pos[0] < cp.pos[c])) {
                                                aim[c] = 1.5;
                                            } else {
                                                aim[c] = Math.random();
                                            }
                                        }
                                        if (cp.stage == 5) {
                                            aim[c] = (Math.random() * 1.5);
                                        }
                                        if (cp.stage == 7) {
                                            if (c != 6) {
                                                if ((Math.random() > Math.random()) || (cp.pos[0] < cp.pos[c])) {
                                                    aim[c] = 1;
                                                }
                                            }
                                        }
                                        if ((cp.stage == 8) && (cn == 14)) {
                                            if (Math.random() > Math.random()) {
                                                aim[c] = (0.76 + (Math.random() * 0.76));
                                            }
                                        }
                                        if (cp.stage == 9) {
                                            aim[c] = 1;
                                            if ((car[0].typ != 14) || ((cp.clear[c] - cp.clear[0]) < 8)) {
                                                if ((attack[c] > 150) && (!onlyou)) {
                                                    attack[c] = 150;
                                                }
                                            }
                                        }
                                        if (cp.stage == 11) {
                                            if (bulistc[c]) {
                                                aim[c] = 0.7;
                                                if (attack[c] > 150) {
                                                    attack[c] = 150;
                                                }
                                            } else {
                                                aim[c] = Math.random();
                                            }
                                        }
                                        if (cp.stage == 12) {
                                            if (Math.random() > Math.random()) {
                                                aim[c] = 0.7;
                                                if (cn == 14) {
                                                    aim[c] += 0.7;
                                                }
                                            }
                                            if (bulistc[c]) {
                                                if (attack[c] > 150) {
                                                    attack[c] = 150;
                                                }
                                            }
                                        }
                                        if (cp.stage == 13) {
                                            if (attack[c] > 60) {
                                                attack[c] = 60;
                                            }
                                        }
                                        if (cp.stage == 15) {
                                            aim[c] = (Math.random() * 1.5);
                                            attack[c] = (attack[c] / 2);
                                            if (Math.random() > Math.random()) {
                                                exitattack[c] = true;
                                            } else {
                                                exitattack[c] = false;
                                            }
                                        }
                                        if (cp.stage == 16) {
                                            if (cn == 14) {
                                                aim[c] = (0.2 + (Math.random() * 0.8));
                                                attack[c] = 70;
                                            }
                                            if (cn == 16) {
                                                if (Math.random() > Math.random()) {
                                                    aim[c] = 0.7;
                                                }
                                                if (attack[c] > 150) {
                                                    attack[c] = 150;
                                                }
                                            }
                                            if (cn == 18 || cn == 12 || cn == 17) {
                                                aim[c] = (Math.random() * 1.5);
                                                if ((Math.abs(cp.clear[i] - clear[c]) <= 2) || cn == 17) {
                                                    attack[c] = (attack[c] / 3);
                                                }
                                            }
                                        }
                                        acr[c] = i;
                                        turntyp[c] = Math.floor(1 + Math.random() * 2);
                                        if (turntyp[c] == 3) {
                                            turntyp[c] = 2;
                                        }
                                    }
                                }
                                if ((startsway) && (vis > 100) && (pyo((car[c].x / 10), (car[i].x / 10), (car[c].z / 10), (car[i].z / 10)) < 300) && (Math.random() > (0.6 - (cp.pos[c] / 10)))) {
                                    clrnce[c] = 0;
                                    acuracy[c] = 0;
                                }
                            }
                        }
                    }
                    var norunfix = false;
                    if (cp.stage == 6 || cp.stage == 10 || cp.stage == 11 || cp.stage == 14) {
                        norunfix = true;
                    }
                    if ((cp.stage == 8) && (cn != 14)) {
                        norunfix = true;
                    }
                    if ((cp.stage == 15) && (!bulistc[c])) {
                        norunfix = true;
                    }
                    if (cp.stage == 17) {
                        norunfix = true;
                    }
                    if (trfix[c] != 3) {
                        trfix[c] = 0;
                        var trunfix = 50;
                        if (cp.stage == 16) {
                            trunfix = 100;
                        }
                        if ((100 * hitmag[c] / cd.maxmag[cn]) > trunfix) {
                            trfix[c] = 1;
                        }
                        if (!norunfix) {
                            var runfix = 80;
                            if (cp.stage == 9) {
                                runfix = 70;
                            }
                            if ((100 * hitmag[c] / cd.maxmag[cn]) > runfix) {
                                trfix[c] = 2;
                            }
                        }
                    } else {
                        upwait[c] = 0;
                        acuracy[c] = 0;
                        skiplev[c] = 1;
                        clrnce[c] = 2;
                    }
                    if (!bulistc[c]) {
                        if ((cp.stage == 8) && (cn == 14)) {
                            bulistc[c] = true;
                        }
                        if ((cp.stage == 11) && (cn == 16)) {
                            bulistc[c] = true;
                        }
                        if ((cp.stage == 12) && (cn == 16)) {
                            bulistc[c] = true;
                        }
                        if ((cp.stage == 15) && ((cp.clear[0] - cp.clear[c]) >= 2) && (trfix[c] == 0)) {
                            bulistc[c] = true;
                            oupnt[c] = -1;
                        }
                        if (cp.stage == 16) {
                            if ((cn == 14) && (cp.clear[c] >= 1)) {
                                bulistc[c] = true;
                            }
                            if (cn == 16) {
                                bulistc[c] = true;
                            }
                        }
                        if (cp.stage == 5 || cp.stage == 8) {
                            if ((cn == 16) && (Math.abs(cp.clear[0] - clear[c]) >= 2)) {
                                bulistc[c] = true;
                            }
                        }
                    } else {}
                    stcnt[c] = 0;
                    statusque[c] = Math.floor(20 * Math.random());
                } else {
                    if (frgm >= m) {
                        stcnt[c]++;
                    }
                }
            }
            var ride = false;
            if (usebounce[c]) {
                ride = wtouch[c];
            } else {
                ride = mtouch[c];
            }
            if (ride) {
                if (trickfase[c] != 0) {
                    trickfase[c] = 0;
                }
                if (trfix[c] == 2 || trfix[c] == 3) {
                    attack[c] = 0;
                }
                if (attack[c] == 0) {
                    if (upcnt[c] < 30) {
                        if (revstart[c] <= 0) {
                            u[c].up = true;
                        } else {
                            u[c].down = true;
                            if (frgm >= m) {
                                revstart[c]--;
                            }
                        }
                    }
                    if (upcnt[c] < (25 + actwait[c])) {
                        if (frgm >= m) {
                            upcnt[c]++;
                        }
                    } else {
                        upcnt[c] = 0;
                        actwait[c] = upwait[c];
                    }
                    var pnt = point[c];
                    var powbul = 50;
                    if (cp.stage == 8) {
                        powbul = 20;
                    }
                    if (cp.stage == 15) {
                        powbul = 40;
                    }
                    if (cp.stage == 16) {
                        if (cn == 14 || cn == 16) {
                            powbul = 0;
                        }
                    }
                    if ((!bulistc[c]) || (trfix[c] == 2) || (trfix[c] == 3) || (trfix[c] == 4) || (power[c] < powbul)) {
                        var tpnt = 0;
                        if ((rampp[c] == 1) && (cp.typ[pnt] <= 0)) {
                            tpnt = (pnt + 1);
                            if (tpnt >= cp.n) {
                                tpnt = 0;
                            }
                            if (cp.typ[tpnt] == -2) {
                                pnt = tpnt;
                            }
                        }
                        if (rampp[c] == -1) {
                            if (cp.typ[pnt] == -2) {
                                pnt++;
                                if (pnt >= cp.n) {
                                    pnt = 0;
                                }
                            }
                        }
                        if ((cp.stage != 9) || (pnt != 0)) {
                            if (Math.random() > skiplev[c]) {
                                tpnt = pnt;
                                var notimpcp = false;
                                if (cp.typ[tpnt] > 0) {
                                    var ic = 0;
                                    for (var i = 0; i < cp.n; i++) {
                                        if ((cp.typ[i] > 0) && (i < tpnt)) {
                                            ic++;
                                        }
                                    }
                                    notimpcp = (clear[c] != (ic + (nlaps[c] * cp.nsp)));
                                }
                                while (cp.typ[tpnt] == 0 || cp.typ[tpnt] == -1 || cp.typ[tpnt] == -3 || notimpcp) {
                                    pnt = tpnt;
                                    tpnt++;
                                    if (tpnt >= cp.n) {
                                        tpnt = 0;
                                    }
                                    notimpcp = false;
                                    if (cp.typ[tpnt] > 0) {
                                        var ic = 0;
                                        for (var i = 0; i < cp.n; i++) {
                                            if ((cp.typ[i] > 0) && (i < tpnt)) {
                                                ic++;
                                            }
                                        }
                                        notimpcp = (clear[c] != (ic + (nlaps[c] * cp.nsp)));
                                    }
                                }
                            } else {
                                if (Math.random() > skiplev[c]) {
                                    while (cp.typ[pnt] == -1) {
                                        pnt++;
                                        if (pnt >= cp.n) {
                                            pnt = 0;
                                        }
                                    }
                                }
                            }
                        }
                        if ((cp.stage == 1) && (unlocked == 1)) {
                            if (pnt == 20) {
                                pnt = 0;
                            }
                        }
                        if (cp.stage == 11) {
                            if ((pcleared[c] == 18) && (pnt >= 26)) {
                                if (pnt <= 32) {
                                    pnt = 32;
                                } else {
                                    pnt = 38;
                                }
                            }
                            if (pcleared[c] == 67) {
                                pnt = 74;
                            }
                        }
                        if (cp.stage == 12) {
                            if (pcleared[c] == 27 || pcleared[c] == 37) {
                                while (cp.typ[pnt] == -1) {
                                    pnt++;
                                    if (pnt >= cp.n) {
                                        pnt = 0;
                                    }
                                }
                            }
                        }
                        if (cp.stage == 13) {
                            if ((pcleared[c] == 20) && (focus[c] == 36) && (car[c].y < 100)) {
                                pnt = 30;
                                if (pyo((car[c].x / 10), (cp.x[30] / 10), (car[c].z / 10), (cp.z[30] / 10)) < 1000) {
                                    focus[c] = -1;
                                }
                            }
                            if ((pcleared[c] == 20) && (trfix[c] < 2)) {
                                if ((pnt >= 26) && (pnt < 30)) {
                                    pnt = 30;
                                }
                            }
                            if ((pcleared[c] == 52) && (trfix[c] < 2)) {
                                pnt = 60;
                            }
                            if (trfix[c] == 3 || trfix[c] == 4) {
                                nofocus[c] = true;
                                if (pnt < 66) {
                                    pnt = 66;
                                }
                            }
                            if (trfix[c] == 1) {
                                fpnt[0] = 61;
                            }
                            if (trfix[c] == 2) {
                                fpnt[0] = 65;
                            }
                            if ((100 * hitmag[c] / cd.maxmag[cn]) < 10) {
                                trfix[c] = 0;
                            }
                            if (trfix[c] == 3) {
                                oupnt[c]++;
                                if (oupnt[c] == 300) {
                                    trfix[c] = 0;
                                }
                            } else {
                                if (oupnt[c] != 0) {
                                    oupnt[c] = 0;
                                }
                            }
                        }
                        if (cp.stage == 14) {
                            if ((pcleared[c] == 47) && (pnt > 58) && (oupnt[c] == 0)) {
                                oupnt[c] = 1;
                            }
                            if ((cn != 17) || (acr[c] == 0)) {
                                while (cp.typ[pnt] == -1) {
                                    pnt++;
                                    if (pnt >= cp.n) {
                                        pnt = 0;
                                    }
                                }
                            }
                        }
                        if (cp.stage == 15) {
                            if ((pcleared[c] == 10) && (trfix[c] < 2)) {
                                if (pnt != 18) {
                                    pnt = 18;
                                }
                            }
                        }
                        if (cp.stage == 16) {
                            if ((trfix[c] != 2) && (trfix[c] != 3)) {
                                if ((pcleared[c] == 152) && (car[c].z < 2700)) {
                                    pnt = 5;
                                }
                                if ((pcleared[c] == 10) && (car[c].x < 700)) {
                                    pnt = 13;
                                }
                                if (pcleared[c] == 20) {
                                    if ((car[c].z < 6200) && (car[c].z > 3400)) {
                                        pnt = 126;
                                    }
                                    if (car[c].z < 3400) {
                                        pnt = 35;
                                    }
                                }
                                if ((pcleared[c] == 35) && (car[c].x < 6300) && (car[c].x > 4000)) {
                                    pnt = 116;
                                }
                                if ((pcleared[c] == 55) && (car[c].x < 4500)) {
                                    pnt = 59;
                                }
                                if (pcleared[c] == 64) {
                                    pnt = 74;
                                }
                                if (pcleared[c] == 74) {
                                    pnt = 82;
                                }
                                if (pcleared[c] == 82) {
                                    pnt = 92;
                                }
                                if (pcleared[c] == 103) {
                                    pnt = 112;
                                }
                                if ((pcleared[c] == 112) && (car[c].x > 3200)) {
                                    pnt = 120;
                                }
                                if ((pcleared[c] == 120) && (car[c].z > 2800)) {
                                    pnt = 129;
                                }
                                if ((pcleared[c] == 129)) {
                                    pnt = 152;
                                }
                            }
                            if (((cp.clear[c] - cp.clear[0]) >= 2) && (pyo((car[c].x / 10), (car[0].x / 10), (car[c].z / 10), (car[0].z / 10)) < (1000 + avoidnlev[c]))) {
                                var myxz = car[c].xz;
                                if (u[c].zyinv) {
                                    myxz += 180;
                                }
                                while (myxz < 0) {
                                    myxz += 360;
                                }
                                while (myxz > 180) {
                                    myxz -= 360;
                                }
                                var ad = 0;
                                if ((car[0].x - car[c].x) >= 0) {
                                    ad = 180;
                                }
                                var pnxz = Math.floor(90 + ad + ((Math.atan(((car[0].z - car[c].z) / (car[0].x - car[c].x))) / 0.017453292519943295)));
                                while (pnxz < 0) {
                                    pnxz += 360;
                                }
                                while (pnxz > 180) {
                                    pnxz -= 360;
                                }
                                var vis = Math.abs(myxz - pnxz);
                                if (vis > 180) {
                                    vis = Math.abs(vis - 360);
                                }
                                if (vis < 90) {
                                    wall[c] = 0;
                                }
                            }
                        }
                        if (rampp[c] == 2) {
                            tpnt = (pnt + 1);
                            if (tpnt >= cp.n) {
                                tpnt = 0;
                            }
                            if ((cp.typ[tpnt] == -2) && (pnt != point[c])) {
                                pnt--;
                                if (pnt < 0) {
                                    pnt += cp.n;
                                }
                            }
                        }
                        if (bulistc[c]) {
                            nofocus[c] = true;
                            if (gowait[c]) {
                                gowait[c] = false;
                            }
                        }
                    } else {
                        if (cp.stage != 15 || runbul[c] == 0) {
                            pnt -= 2;
                            if (pnt < 0) {
                                pnt += cp.n;
                            }
                            while (cp.typ[pnt] == -4) {
                                pnt--;
                                if (pnt < 0) {
                                    pnt += cp.n;
                                }
                            }
                        }
                        if (cp.stage == 11) {
                            if ((pnt < 38) && (pnt > 25)) {
                                pnt = 25;
                            }
                        }
                        if (cp.stage == 12) {
                            if (!gowait[c]) {
                                if (cp.clear[0] == 0) {
                                    wtx[c] = 350;
                                    wtz[c] = 1900;
                                    frx[c] = 350;
                                    frz[c] = 3900;
                                    frad[c] = 12000;
                                    oupnt[c] = 37;
                                    gowait[c] = true;
                                    afta[c] = false;
                                }
                                if (cp.clear[0] == 7) {
                                    wtx[c] = 4480;
                                    wtz[c] = 4032;
                                    frx[c] = 4480;
                                    frz[c] = 3472;
                                    frad[c] = 30000;
                                    oupnt[c] = 27;
                                    gowait[c] = true;
                                    afta[c] = false;
                                }
                                if (cp.clear[0] == 10) {
                                    wtx[c] = 0;
                                    wtz[c] = 4873.9;
                                    frx[c] = 0;
                                    frz[c] = 3858.9;
                                    frad[c] = 90000;
                                    oupnt[c] = 55;
                                    gowait[c] = true;
                                    afta[c] = false;
                                }
                                if (cp.clear[0] == 14) {
                                    wtx[c] = 350;
                                    wtz[c] = 1900;
                                    frx[c] = 1470;
                                    frz[c] = 3900;
                                    frad[c] = 45000;
                                    oupnt[c] = 37;
                                    gowait[c] = true;
                                    afta[c] = false;
                                }
                                if (cp.clear[0] == 18) {
                                    wtx[c] = 4830;
                                    wtz[c] = -455;
                                    frx[c] = 4830;
                                    frz[c] = 560;
                                    frad[c] = 90000;
                                    oupnt[c] = 17;
                                    gowait[c] = true;
                                    afta[c] = false;
                                }
                            }
                            if (gowait[c]) {
                                if (pyo((car[c].x / 10), (wtx[c] / 10), (car[c].z / 10), (wtz[c] / 10)) < 10000) {
                                    if (speed[c] > 5) {
                                        u[c].up = false;
                                    }
                                }
                                if (pyo((car[c].x / 10), (wtx[c] / 10), (car[c].z / 10), (wtz[c] / 10)) < 200) {
                                    u[c].up = false;
                                    u[c].handb = true;
                                }
                                if ((pcleared[0] == oupnt[c]) && (pyo((car[0].x / 10), (frx[c] / 10), (car[0].z / 10), (frz[c] / 10)) < frad[c])) {
                                    afta[c] = true;
                                    gowait[c] = false;
                                }
                                if (pyo((car[c].x / 10), (car[0].x / 10), (car[c].z / 10), (car[0].z / 10)) < 25) {
                                    afta[c] = true;
                                    gowait[c] = false;
                                    attack[c] = 200;
                                    acr[c] = 0;
                                }
                            }
                        }
                        if (cp.stage == 15) {
                            if (oupnt[c] == -1) {
                                var pyclos = -10;
                                for (var i = 0; i < cp.n; i++) {
                                    if ((cp.typ[i] == -2) && (i < 71)) {
                                        if ((pyo((car[c].x / 10), (cp.x[i] / 10), (car[c].z / 10), (cp.z[i] / 10)) < pyclos) || (pyclos == -10)) {
                                            pyclos = pyo((car[c].x / 10), (cp.x[i] / 10), (car[c].z / 10), (cp.z[i] / 10));
                                            oupnt[c] = i;
                                        }
                                    }
                                }
                                oupnt[c]--;
                                if (oupnt[c] < 0) {
                                    oupnt[c] += cp.n;
                                }
                            }
                            if ((oupnt[c] >= 0) && (oupnt[c] < cp.n)) {
                                pnt = oupnt[c];
                                if (pyo((car[c].x / 10), (cp.x[pnt] / 10), (car[c].z / 10), (cp.z[pnt] / 10)) < 800) {
                                    oupnt[c] = -Math.floor(75 + (Math.random() * 200));
                                    runbul[c] = Math.floor(50 + (Math.random() * 100));
                                }
                            }
                            if (oupnt[c] < -1) {
                                oupnt[c]++;
                            }
                            if (runbul[c] != 0) {
                                runbul[c]--;
                            }
                        }
                        if (cp.stage == 16) {
                            if (cn == 14) {
                                if (power[c] > 60) {
                                    var i = pcleared[0];
                                    var found = -1;
                                    while (found == -1) {
                                        i++;
                                        if (i >= cp.n) {
                                            i -= cp.n;
                                            found = 152;
                                        }
                                        if (cp.typ[i] == 1 || cp.typ[i] == 2) {
                                            found = i;
                                        }
                                    }
                                    if (found == 129) {
                                        found = 152;
                                    }
                                    if (pyo((car[c].x / 10), (cp.x[found] / 10), (car[c].z / 10), (cp.z[found] / 10)) < 1000) {
                                        acr[c] = 0;
                                        aim[c] = 1;
                                        attack[c] = 100;
                                    }
                                    pnt = found;
                                } else {
                                    var pyclos = -10;
                                    for (var i = 0; i < cp.n; i++) {
                                        if (obo[cp.obi[i]].typ == 24 || obo[cp.obi[i]].typ == 25 || obo[cp.obi[i]].typ == 43 || obo[cp.obi[i]].typ == 45) {
                                            if ((pyo((car[c].x / 10), (cp.x[i] / 10), (car[c].z / 10), (cp.z[i] / 10)) < pyclos) || (pyclos == -10)) {
                                                pyclos = pyo((car[c].x / 10), (cp.x[i] / 10), (car[c].z / 10), (cp.z[i] / 10));
                                                pnt = i;
                                            }
                                        }
                                    }
                                }
                            }
                            if (cn == 16) {
                                if (!gowait[c]) {
                                    if (pcleared[0] == 152 || pcleared[0] == 10 || pcleared[0] == 20) {
                                        wtx[c] = 820;
                                        wtz[c] = 120;
                                        frx[c] = 1364;
                                        frz[c] = 218;
                                        frad[c] = 50000;
                                        oupnt[c] = 35;
                                        gowait[c] = true;
                                        afta[c] = false;
                                        runbul[c] = 1;
                                    }
                                    if (pcleared[0] == 45 || pcleared[0] == 55) {
                                        if (power[c] > 60) {
                                            wtx[c] = 3000;
                                            wtz[c] = 1600;
                                            frx[c] = 4206;
                                            frz[c] = 1365;
                                            frad[c] = 30000;
                                            oupnt[c] = 64;
                                            gowait[c] = true;
                                            afta[c] = false;
                                            runbul[c] = 1;
                                        } else {
                                            pnt = 73;
                                        }
                                    }
                                    if (pcleared[0] == 92 || pcleared[0] == 103) {
                                        if (power[c] > 60) {
                                            wtx[c] = 6408.2;
                                            wtz[c] = 1571.4;
                                            frx[c] = 6184;
                                            frz[c] = 780;
                                            frad[c] = 90000;
                                            oupnt[c] = 112;
                                            gowait[c] = true;
                                            afta[c] = false;
                                            runbul[c] = 0;
                                        } else {
                                            pnt = 73;
                                        }
                                    }
                                    if ((pcleared[0] == 112) && (oupnt[c] == 112)) {
                                        stcnt[c] = 0;
                                        statusque[c] = 10;
                                        if (pyo((car[c].x / 10), (frx[c] / 10), (car[c].z / 10), (frz[c] / 10)) < 100) {
                                            attack[c] = 200;
                                            acr[c] = 0;
                                            aim[c] = 0.7;
                                            oupnt[c] = -1;
                                        }
                                    }
                                }
                                if (gowait[c]) {
                                    if (pyo((car[c].x / 10), (wtx[c] / 10), (car[c].z / 10), (wtz[c] / 10)) < 10000) {
                                        if (speed[c] > 5) {
                                            u[c].up = false;
                                        }
                                    }
                                    if (pyo((car[c].x / 10), (wtx[c] / 10), (car[c].z / 10), (wtz[c] / 10)) < 200) {
                                        u[c].up = false;
                                        u[c].handb = true;
                                    }
                                    if ((pcleared[0] == oupnt[c]) && (pyo((car[0].x / 10), (frx[c] / 10), (car[0].z / 10), (frz[c] / 10)) < frad[c])) {
                                        afta[c] = true;
                                        gowait[c] = false;
                                        if (runbul[c]) {
                                            attack[c] = 200;
                                            acr[c] = 0;
                                            aim[c] = 0.7;
                                        }
                                    }
                                    if (pyo((car[c].x / 10), (car[0].x / 10), (car[c].z / 10), (car[0].z / 10)) < 25) {
                                        afta[c] = true;
                                        gowait[c] = false;
                                        attack[c] = 200;
                                        acr[c] = 0;
                                    }
                                }
                            }
                        }
                        nofocus[c] = true;
                    }
                    if (cp.stage != 17) {
                        if (missedcp[c] == 0 || forget[c] || trfix[c] == 4) {
                            if (trfix[c] != 0) {
                                var istr = 0;
                                if ((cp.stage == 9) && (car[0].typ == 14) && ((cp.clear[c] - cp.clear[0]) >= 4)) {
                                    istr = 1;
                                }
                                if (cp.stage == 16) {
                                    istr = 2;
                                }
                                if (trfix[c] == 2) {
                                    if (cp.stage == 15) {
                                        istr = 2;
                                    }
                                    var pyclos = -10;
                                    var closi = 0;
                                    for (var i = istr; i < nf; i++) {
                                        if ((pyo((car[c].x / 10), (cp.x[fpnt[i]] / 10), (car[c].z / 10), (cp.z[fpnt[i]] / 10)) < pyclos) || (pyclos == -10)) {
                                            pyclos = pyo((car[c].x / 10), (cp.x[fpnt[i]] / 10), (car[c].z / 10), (cp.z[fpnt[i]] / 10));
                                            closi = i;
                                        }
                                    }
                                    if (cp.stage == 12) {
                                        closi = 1;
                                    }
                                    pnt = fpnt[closi];
                                    if (cp.special[closi]) {
                                        forget[c] = true;
                                    } else {
                                        forget[c] = false;
                                    }
                                }
                                for (var i = istr; i < nf; i++) {
                                    if (pyo((car[c].x / 10), (cp.x[fpnt[i]] / 10), (car[c].z / 10), (cp.z[fpnt[i]] / 10)) < 2000) {
                                        forget[c] = false;
                                        actwait[c] = 0;
                                        upwait[c] = 0;
                                        turntyp[c] = 2;
                                        randtcnt[c] = -1;
                                        acuracy[c] = 0;
                                        rampp[c] = 0;
                                        trfix[c] = 3;
                                    }
                                }
                                if (trfix[c] == 3) {
                                    nofocus[c] = true;
                                }
                            }
                        }
                    }
                    if (turncnt[c] > randtcnt[c]) {
                        if (!gowait[c]) {
                            var ad = 0;
                            if ((cp.x[pnt] - car[c].x) >= 0) {
                                ad = 180;
                            }
                            pan[c] = Math.floor(90 + ad + ((Math.atan(((cp.z[pnt] - car[c].z) / (cp.x[pnt] - car[c].x))) / 0.017453292519943295)));
                        } else {
                            var ad = 0;
                            if ((wtx[c] - car[c].x) >= 0) {
                                ad = 180;
                            }
                            pan[c] = Math.floor(90 + ad + ((Math.atan(((wtz[c] - car[c].z) / (wtx[c] - car[c].x))) / 0.017453292519943295)));
                        }
                        turncnt[c] = 0;
                        randtcnt[c] = Math.floor(acuracy[c] * Math.random());
                    } else {
                        if (frgm >= m) {
                            turncnt[c]++;
                        }
                    }
                } else {
                    u[c].up = true;
                    var ad = 0;
                    var adsto = ((py(car[c].x, car[acr[c]].x, car[c].z, car[acr[c]].z) / 2) * aim[c]);
                    var acx = (car[acr[c]].x - (adsto * msin(mxz[acr[c]])));
                    var acz = (car[acr[c]].z + (adsto * mcos(mxz[acr[c]])));
                    if ((acx - car[c].x) >= 0) {
                        ad = 180;
                    }
                    pan[c] = (90 + ad + ((Math.atan(((acz - car[c].z) / (acx - car[c].x))) / 0.017453292519943295)));
                    if (frgm >= m) {
                        attack[c]--;
                    }
                    if (attack[c] <= 0) {
                        attack[c] = 0;
                    }
                    if ((cp.stage == 15) && (exitattack[c]) && (!bulistc[c]) && (missedcp[c] != 0)) {
                        attack[c] = 0;
                    }
                    if ((cp.stage == 16) && (missedcp[c] != 0)) {
                        if ((cp.pos[c] == 0) || ((cp.pos[c] == 1) && (cp.pos[0] == 0))) {
                            attack[c] = 0;
                        }
                    }
                    if ((cp.stage == 16) && (cp.pos[0] > cp.pos[c]) && (power[c] < 80)) {
                        attack[c] = 0;
                    }
                }
                var crxz = car[c].xz;
                if (u[c].zyinv) {
                    crxz += 180;
                }
                while (crxz < 0) {
                    crxz += 360;
                }
                while (crxz > 180) {
                    crxz -= 360;
                }
                while (pan[c] < 0) {
                    pan[c] += 360;
                }
                while (pan[c] > 180) {
                    pan[c] -= 360;
                }
                if ((wall[c] != -1) && (hold[c] == 0)) {
                    clrnce[c] = 0;
                }
                if (hold[c] == 0) {
                    if (Math.abs(crxz - pan[c]) < 180) {
                        if (Math.floor(Math.abs(crxz - pan[c])) > clrnce[c]) {
                            if (crxz > pan[c]) {
                                u[c].left = true;
                                lastl[c] = true;
                            } else {
                                u[c].right = true;
                                lastl[c] = false;
                            }
                            if ((Math.abs(crxz - pan[c]) > 50) && (speed[c] > cd.swits[cn][0]) && (turntyp[c] != 0)) {
                                if (turntyp[c] == 1) {
                                    u[c].down = true;
                                }
                                if (turntyp[c] == 2) {
                                    u[c].handb = true;
                                }
                                if (!agressed[c]) {
                                    u[c].up = false;
                                }
                            }
                        }
                    } else {
                        if (Math.floor(Math.abs(crxz - pan[c])) < (360 - clrnce[c])) {
                            if (crxz > pan[c]) {
                                u[c].right = true;
                                lastl[c] = false;
                            } else {
                                u[c].left = true;
                                lastl[c] = true;
                            }
                            if ((Math.abs(crxz - pan[c]) < 310) && (speed[c] > cd.swits[cn][0]) && (turntyp[c] != 0)) {
                                if (turntyp[c] == 1) {
                                    u[c].down = true;
                                }
                                if (turntyp[c] == 2) {
                                    u[c].handb = true;
                                }
                                if (!agressed[c]) {
                                    u[c].up = false;
                                }
                            }
                        }
                    }
                }
                if (wall[c] != -1) {
                    if (lwall[c] != wall[c]) {
                        if (lastl[c]) {
                            u[c].left = true;
                        } else {
                            u[c].right = true;
                        }
                        wlastl[c] = lastl[c];
                        lwall[c] = wall[c];
                    } else {
                        if (wlastl[c]) {
                            u[c].left = true;
                        } else {
                            u[c].right = true;
                        }
                    }
                    if (build[obo[wall[c]].typ].dam != 0) {
                        var hmlt = 1;
                        if (build[obo[wall[c]].typ].skid == 1) {
                            hmlt = 3;
                        }
                        hold[c] += hmlt;
                        if (hold[c] > (10 * hmlt)) {
                            hold[c] = (10 * hmlt);
                        }
                    } else {
                        hold[c] = 1;
                    }
                    wall[c] = -1;
                } else {
                    if (hold[c] != 0) {
                        hold[c]--;
                    }
                }
            } else {
                if (trickfase[c] == 0) {
                    var upv = (((scy[c][0] + scy[c][1] + scy[c][2] + scy[c][3]) * (car[c].y + 5)) / 40);
                    var divo = 3;
                    if (cp.stage == 15 || cp.stage == 16) {
                        divo = 10;
                    }
                    if ((cp.stage == 13) && (pcleared[c] == 20) && (point[c] > 32) && (cp.clear[c] - cp.clear[0] <= 3)) {
                        upv = 0;
                    }
                    if ((cp.stage == 16) && (pcleared[c] == 120) && (car[c].z < 2200)) {
                        upv = 0;
                    }
                    if ((upv > 7) && ((Math.random() > (trickprf[c] / divo)) || (stuntf[c] == 4))) {
                        oxy[c] = pxy[c];
                        ozy[c] = pzy[c];
                        flycnt[c] = 0;
                        uddirect[c] = 0;
                        lrdirect[c] = 0;
                        udswt[c] = false;
                        lrswt[c] = false;
                        trickfase[c] = 1;
                        if (upv < 16) {
                            uddirect[c] = -1;
                            udstart[c] = 0;
                            udswt[c] = false;
                        } else {
                            if (((Math.random() > Math.random()) && (stuntf[c] != 3)) || (stuntf[c] == 1) || (stuntf[c] == 2) || (stuntf[c] == 4)) {
                                if ((stuntf[c] == 4) && (pcleared[c] == 47) && (oupnt[c] == 0)) {
                                    stuntf[c] = 5;
                                }
                                if ((Math.random() > Math.random() || stuntf[c] == 2 || stuntf[c] == 5) && (stuntf[c] != 1) && (stuntf[c] != 4)) {
                                    uddirect[c] = -1;
                                } else {
                                    uddirect[c] = 1;
                                }
                                udstart[c] = Math.floor(10 * Math.random() * trickprf[c]);
                                if (stuntf[c] == 4 || stuntf[c] == 5 || cp.stage == 16) {
                                    udstart[c] = 0;
                                }
                                if ((Math.random() > 0.85) && (stuntf[c] != 1) && (stuntf[c] != 4) && (stuntf[c] != 5)) {
                                    udswt[c] = true;
                                }
                                if ((Math.random() > (trickprf[c] + 0.3)) && (stuntf[c] != 1) && (stuntf[c] != 2) && (stuntf[c] != 4) && (stuntf[c] != 5)) {
                                    if (Math.random() > Math.random()) {
                                        lrdirect[c] = -1;
                                    } else {
                                        lrdirect[c] = 1;
                                    }
                                    lrstart[c] = Math.floor(30 * Math.random());
                                    if (Math.random() > 0.75) {
                                        lrswt[c] = true;
                                    }
                                }
                            } else {
                                if (Math.random() > Math.random()) {
                                    lrdirect[c] = -1;
                                } else {
                                    lrdirect[c] = 1;
                                }
                                lrstart[c] = Math.floor(10 * Math.random() * trickprf[c]);
                                if (Math.random() > 0.75) {
                                    lrswt[c] = true;
                                }
                                if (Math.random() > (trickprf[c] + 0.3)) {
                                    if ((Math.random() > Math.random()) || (stuntf[c] == 3)) {
                                        uddirect[c] = -1;
                                    } else {
                                        uddirect[c] = 1;
                                    }
                                    udstart[c] = Math.floor(30 * Math.random());
                                    if (Math.random() > 0.85) {
                                        udswt[c] = true;
                                    }
                                }
                            }
                        }
                        if ((cp.stage == 16) && (cn == 16)) {
                            lrdirect[c] = -1;
                            lrstart[c] = 0;
                            uddirect[c] = -1;
                            udstart[c] = 0;
                        }
                        if (trfix[c] == 3 || trfix[c] == 4) {
                            if (cp.stage != 8) {
                                if (lrdirect[c] == -1) {
                                    uddirect[c] = -1;
                                }
                                lrdirect[c] = 0;
                                if (power[c] < 60) {
                                    uddirect[c] = -1;
                                }
                            } else {
                                if (uddirect[c] != 0) {
                                    uddirect[c] = -1;
                                }
                                lrdirect[c] = 0;
                            }
                        }
                    } else {
                        trickfase[c] = -1;
                    }
                    if (!afta[c]) {
                        afta[c] = true;
                    }
                    if (trfix[c] == 3) {
                        trfix[c] = 4;
                        statusque[c] += 30;
                    }
                }
                if (trickfase[c] == 1) {
                    flycnt[c]++;
                    if (lrdirect[c] != 0) {
                        if (flycnt[c] > lrstart[c]) {
                            if (lrswt[c]) {
                                if (Math.abs(pxy[c] - oxy[c]) > 180) {
                                    if (lrdirect[c] == -1) {
                                        lrdirect[c] = 1;
                                    } else {
                                        lrdirect[c] = -1;
                                    }
                                    lrswt[c] = false;
                                }
                            }
                            if (lrdirect[c] == -1) {
                                u[c].handb = true;
                                u[c].left = true;
                            } else {
                                u[c].handb = true;
                                u[c].right = true;
                            }
                        }
                    }
                    if (uddirect[c] != 0) {
                        if (flycnt[c] > udstart[c]) {
                            if (udswt[c]) {
                                if (Math.abs(pzy[c] - ozy[c]) > 180) {
                                    if (uddirect[c] == -1) {
                                        uddirect[c] = 1;
                                    } else {
                                        uddirect[c] = -1;
                                    }
                                    udswt[c] = false;
                                }
                            }
                            if (uddirect[c] == -1) {
                                u[c].handb = true;
                                u[c].down = true;
                            } else {
                                u[c].handb = true;
                                u[c].up = true;
                                if (apunch[c] > 0) {
                                    u[c].down = true;
                                    apunch[c]--;
                                }
                            }
                        }
                    }
                    if (((scy[c][0] + scy[c][1] + scy[c][2] + scy[c][3]) * 100 / (car[c].y + 5)) < -saftey[c]) {
                        onceu[c] = false;
                        onced[c] = false;
                        oncel[c] = false;
                        oncer[c] = false;
                        lrcomp[c] = false;
                        udcomp[c] = false;
                        udbare[c] = false;
                        lrbare[c] = false;
                        trickfase[c] = 2;
                        swat[c] = 0;
                    }
                }
                if (trickfase[c] == 2) {
                    if (swat[c] == 0) {
                        if (dcomp[c] != 0 || ucomp[c] != 0) {
                            udbare[c] = true;
                        }
                        if (lcomp[c] != 0 || rcomp[c] != 0) {
                            lrbare[c] = true;
                        }
                        swat[c] = 1;
                    }
                    if (wtouch[c]) {
                        if (swat[c] == 1) {
                            swat[c] = 2;
                        }
                    } else {
                        if (swat[c] == 2) {
                            if ((capsized[c]) && (Math.random() > mustland[c])) {
                                if (udbare[c]) {
                                    lrbare[c] = true;
                                    udbare[c] = false;
                                } else {
                                    if (lrbare[c]) {
                                        udbare[c] = true;
                                        lrbare[c] = false;
                                    }
                                }
                            }
                            swat[c] = 3;
                        }
                    }
                    if (udbare[c]) {
                        var pzyr = (pzy[c] + 90);
                        while (pzyr < 0) {
                            pzyr += 360;
                        }
                        while (pzyr > 180) {
                            pzyr -= 360;
                        }
                        pzyr = Math.abs(pzyr);
                        if (Math.abs(lcomp[c] - rcomp[c]) < 5) {
                            if (onced[c] || onceu[c]) {
                                udcomp[c] = true;
                            }
                        }
                        if (dcomp[c] > ucomp[c]) {
                            if (capsized[c]) {
                                if (udcomp[c]) {
                                    if (pzyr < 90) {
                                        u[c].up = true;
                                    } else {
                                        u[c].down = true;
                                    }
                                } else {
                                    if (!onced[c]) {
                                        u[c].down = true;
                                    }
                                }
                            } else {
                                if (udcomp[c]) {
                                    if ((perfection[c]) && (Math.abs(pzyr - 90) > 30)) {
                                        if (pzyr < 90) {
                                            u[c].up = true;
                                        } else {
                                            u[c].down = true;
                                        }
                                    }
                                } else {
                                    if (Math.random() > mustland[c]) {
                                        u[c].up = true;
                                    }
                                }
                                onced[c] = true;
                            }
                        } else {
                            if (capsized[c]) {
                                if (udcomp[c]) {
                                    if (pzyr < 90) {
                                        u[c].up = true;
                                    } else {
                                        u[c].down = true;
                                    }
                                } else {
                                    if (!onceu[c]) {
                                        u[c].up = true;
                                    }
                                }
                            } else {
                                if (udcomp[c]) {
                                    if ((perfection[c]) && (Math.abs(pzyr - 90) > 30)) {
                                        if (pzyr < 90) {
                                            u[c].up = true;
                                        } else {
                                            u[c].down = true;
                                        }
                                    }
                                } else {
                                    if (Math.random() > mustland[c]) {
                                        u[c].down = true;
                                    }
                                }
                                onceu[c] = true;
                            }
                        }
                    }
                    if (lrbare[c]) {
                        var pxyr = (pxy[c] + 90);
                        if (u[c].zyinv) {
                            pxyr += 180;
                        }
                        while (pxyr < 0) {
                            pxyr += 360;
                        }
                        while (pxyr > 180) {
                            pxyr -= 360;
                        }
                        pxyr = Math.abs(pxyr);
                        if (Math.abs(lcomp[c] - rcomp[c]) < 10) {
                            if (oncel[c] || oncer[c]) {
                                lrcomp[c] = true;
                            }
                        }
                        if (lcomp[c] > rcomp[c]) {
                            if (capsized[c]) {
                                if (lrcomp[c]) {
                                    if (pxyr > 90) {
                                        u[c].left = true;
                                    } else {
                                        u[c].right = true;
                                    }
                                } else {
                                    if (!oncel[c]) {
                                        u[c].left = true;
                                    }
                                }
                            } else {
                                if (lrcomp[c]) {
                                    if ((perfection[c]) && (Math.abs(pxyr - 90) > 30)) {
                                        if (pxyr > 90) {
                                            u[c].left = true;
                                        } else {
                                            u[c].right = true;
                                        }
                                    }
                                } else {
                                    if (Math.random() > mustland[c]) {
                                        u[c].right = true;
                                    }
                                }
                                oncel[c] = true;
                            }
                        } else {
                            if (capsized[c]) {
                                if (lrcomp[c]) {
                                    if (pxyr > 90) {
                                        u[c].left = true;
                                    } else {
                                        u[c].right = true;
                                    }
                                } else {
                                    if (!oncer[c]) {
                                        u[c].right = true;
                                    }
                                }
                            } else {
                                if (lrcomp[c]) {
                                    if ((perfection[c]) && (Math.abs(pxyr - 90) > 30)) {
                                        if (pxyr > 90) {
                                            u[c].left = true;
                                        } else {
                                            u[c].right = true;
                                        }
                                    }
                                } else {
                                    if (Math.random() > mustland[c]) {
                                        u[c].left = true;
                                    }
                                }
                                oncer[c] = true;
                            }
                        }
                    }
                }
            }
        }
    }
}
var drag = 0.05;
var mxz = [], cxz = [];
var dominate = [];
var caught = [];
var pzy = [], pxy = [];
var speed = [];
var forca = [];
var scy = [];
var scz = [];
var scx = [];
var mtouch = [];
var wtouch = [];
var cntouch = [];
var capsized = [];
var txz = [], fxz = [], pmlt = [], nmlt = [], dcnt = [];
var skid = [];
var pushed = [], gtouch = [], pl = [], pr = [], pd = [], pu = [];
var actl = [], actr = [], actu = [], actd = [];
var loop = [];
var ucomp = [], dcomp = [], lcomp = [], rcomp = [];
var uwall = [];
var lxz = [], travxy = [], travzy = [], travxz = [], trcnt = [], capcnt = [], srfcnt = [];
var rtab = [], ftab = [], btab = [], surfer = [];
var powerup = [];
var xtpower = [];
var tilt = [];
var crank = [];
var lcrank = [];
var squash = [], nbsq = [];
var hitmag = [], cntdest = [];
var dest = [];
var embos = [];
var embodir = [];
var embomag = [];
var bshft = [];
var pcleared = [];
var clear = [];
var nlaps = [];
var focus = [];
var power = [];
var missedcp = [];
var lastcolido = [];
var point = [];
var nofocus = [];
var lonorm = [];
function inishmad() {
    for (var c = 0; c < 7; c++) {
        mxz[c] = 0;
        cxz[c] = 0;
        dominate[c] = [];
        caught[c] = [];
        for (var i = 0; i < 7; i++) {
            dominate[c][i] = false;
            caught[c][i] = false;
        }
        pzy[c] = 0;
        pxy[c] = 0;
        speed[c] = 0;
        scy[c] = [];
        scx[c] = [];
        scz[c] = [];
        for (var i = 0; i < 4; i++) {
            scy[c][i] = 0;
            scx[c][i] = 0;
            scz[c][i] = 0;
        }
        forca[c] = (((Math.sqrt((car[c].keyz[0] * car[c].keyz[0]) + (car[c].keyx[0] * car[c].keyx[0])) + Math.sqrt((car[c].keyz[1] * car[c].keyz[1]) + (car[c].keyx[1] * car[c].keyx[1])) + Math.sqrt((car[c].keyz[2] * car[c].keyz[2]) + (car[c].keyx[2] * car[c].keyx[2])) + Math.sqrt((car[c].keyz[3] * car[c].keyz[3]) + (car[c].keyx[3] * car[c].keyx[3]))) / 1000) * (cd.bounce[car[c].typ] - 0.3));
        mtouch[c] = true;
        wtouch[c] = true;
        cntouch[c] = 0;
        capsized[c] = false;
        txz[c] = 0;
        fxz[c] = 0;
        pmlt[c] = 1;
        nmlt[c] = 1;
        dcnt[c] = 0;
        skid[c] = 0;
        pushed[c] = false;
        gtouch[c] = false;
        pl[c] = false;
        pr[c] = false;
        pd[c] = false;
        pu[c] = false;
        actl[c] = false;
        actr[c] = false;
        actu[c] = false;
        actd[c] = false;
        loop[c] = 0;
        ucomp[c] = 0;
        dcomp[c] = 0;
        lcomp[c] = 0;
        rcomp[c] = 0;
        uwall[c] = false;
        lxz[c] = 0;
        travxy[c] = 0;
        travzy[c] = 0;
        travxz[c] = 0;
        trcnt[c] = 0;
        capcnt[c] = 0;
        srfcnt[c] = 0;
        rtab[c] = false;
        ftab[c] = false;
        btab[c] = false;
        surfer[c] = false;
        powerup[c] = 0;
        xtpower[c] = 0;
        tilt[c] = 0;
        crank[c] = [];
        lcrank[c] = [];
        for (var i = 0; i < 4; i++) {
            crank[c][i] = 0;
            lcrank[c][i] = 0;
        }
        squash[c] = 0;
        nbsq[c] = 0;
        hitmag[c] = 0;
        cntdest[c] = 0;
        dest[c] = false;
        embos[c] = 0;
        embodir[c] = 0;
        embomag[c] = 0;
        bshft[c] = 0;
        pcleared[c] = cp.pcs;
        clear[c] = 0;
        nlaps[c] = 0;
        focus[c] = -1;
        power[c] = 98;
        missedcp[c] = 0;
        lastcolido[c] = 0;
        nofocus[c] = false;
        point[c] = 0;
        cp.dested[c] = 0;
    }
    for (var i = 0; i < 2; i++) {
        lonorm[i] = 0;
    }
}
var onautocorrect = 0;
var flipont = false;
function drive() {
    if (ncars != 1) {
        for (var c = 0; c < ncars; c++) {
            for (var xc = 0; xc < ncars; xc++) {
                if (xc != c) {
                    colide(c, xc);
                }
            }
        }
    }
    if (onautocorrect) {
        if (capsized[0]) {
            if (wtouch[0]) {
                if (flipont) {
                    pxy[0] += 180;
                    flipont = false;
                }
            } else {
                flipont = true;
            }
        }
    }
    for (var c = 0; c < ncars; c++) {
        var cn = car[c].typ;
        var mlt = 1;
        var cov = 1;
        var zyinv = false,
        doublinv = false,
        spinlocate = false;
        capsized[c] = false;
        var izy = Math.abs(pzy[c]);
        while (izy > 270) {
            izy -= 360;
        }
        izy = Math.abs(izy);
        if (izy > 90) {
            zyinv = true;
        }
        var xyinv = false;
        var ixy = Math.abs(pxy[c]);
        while (ixy > 270) {
            ixy -= 360;
        }
        ixy = Math.abs(ixy);
        if (ixy > 90) {
            xyinv = true;
            cov = -1;
        }
        var keyy = -car[c].grat;
        if (zyinv) {
            if (xyinv) {
                xyinv = false;
                doublinv = true;
            } else {
                xyinv = true;
                capsized[c] = true;
            }
            mlt = -1;
        } else {
            if (xyinv) {
                capsized[c] = true;
            }
        }
        if (capsized[c]) {
            keyy = (cd.flipy[cn] + squash[c]);
        }
        u[c].zyinv = zyinv;
        var xtrim = 0,
        ztrim = 0,
        ytrim = 0;
        if (mtouch[c]) {
            loop[c] = 0;
        }
        if (wtouch[c]) {
            if (loop[c] == 2 || loop[c] == -1) {
                loop[c] = -1;
                if (u[c].left) {
                    pl[c] = true;
                }
                if (u[c].right) {
                    pr[c] = true;
                }
                if (u[c].up) {
                    pu[c] = true;
                }
                if (u[c].down) {
                    pd[c] = true;
                }
            }
            ucomp[c] = 0;
            dcomp[c] = 0;
            lcomp[c] = 0;
            rcomp[c] = 0;
        }
        if (c == 0) {
            if (!wtouch[c]) {
                if (u[c].up) {
                    if (!actu[c]) {
                        if (loop[c] == 0) {
                            loop[c] = 1;
                        }
                    }
                } else {
                    actu[c] = false;
                }
                if (u[c].down) {
                    if (!actd[c]) {
                        if (loop[c] == 0) {
                            loop[c] = 1;
                        }
                    }
                } else {
                    actd[c] = false;
                }
                if (u[c].left) {
                    if (!actl[c]) {
                        if (loop[c] == 0) {
                            loop[c] = 1;
                        }
                    }
                } else {
                    actl[c] = false;
                }
                if (u[c].right) {
                    if (!actr[c]) {
                        if (loop[c] == 0) {
                            loop[c] = 1;
                        }
                    }
                } else {
                    actr[c] = false;
                }
            } else {
                actl[c] = true;
                actr[c] = true;
                actu[c] = true;
                actd[c] = true;
            }
        }
        if (u[c].handb) {
            if (!pushed[c]) {
                if (!wtouch[c]) {
                    if (loop[c] == 0) {
                        loop[c] = 1;
                        actl[c] = false;
                        actr[c] = false;
                        actu[c] = false;
                        actd[c] = false;
                    }
                } else {
                    if (gtouch[c]) {
                        pushed[c] = true;
                    }
                }
            }
        } else {
            pushed[c] = false;
        }
        if (loop[c] == 1) {
            var avay = ((scy[c][0] + scy[c][1] + scy[c][2] + scy[c][3]) / 4);
            for (var i = 0; i < 4; i++) {
                scy[c][i] = avay;
            }
            loop[c] = 2;
        }
        if (!dest[c]) {
            if (loop[c] == 2) {
                if ((u[c].up) && (!actu[c])) {
                    if (ucomp[c] == 0) {
                        ucomp[c] = (10 + (((-scy[c][0] * 10) + 50) / 20));
                        if (ucomp[c] < 5) {
                            ucomp[c] = 5;
                        }
                        if (ucomp[c] > 10) {
                            ucomp[c] = 10;
                        }
                        ucomp[c] *= cd.airs[cn];
                    }
                    if (ucomp[c] < 20) {
                        ucomp[c] += (0.5 * cd.airs[cn]);
                    }
                    xtrim = (-cd.airc[cn] * msin(car[c].xz) * cov);
                    ztrim = (cd.airc[cn] * mcos(car[c].xz) * cov);
                } else {
                    if (ucomp[c] != 0) {
                        if (ucomp[c] > -2) {
                            ucomp[c] -= (0.5 * cd.airs[cn]);
                        }
                    }
                }
                if ((u[c].down) && (!actd[c])) {
                    if (dcomp[c] == 0) {
                        dcomp[c] = (10 + (((-scy[c][0] * 10) + 50) / 20));
                        if (dcomp[c] < 5) {
                            dcomp[c] = 5;
                        }
                        if (dcomp[c] > 10) {
                            dcomp[c] = 10;
                        }
                        dcomp[c] *= cd.airs[cn];
                    }
                    if (dcomp[c] < 20) {
                        dcomp[c] += (0.5 * cd.airs[cn]);
                    }
                    ytrim = cd.airc[cn];
                } else {
                    if (dcomp[c] != 0) {
                        if (ucomp[c] > -2) {
                            dcomp[c] -= (0.5 * cd.airs[cn]);
                        }
                    }
                }
                if ((u[c].left) && (!actl[c])) {
                    if (lcomp[c] == 0) {
                        lcomp[c] = 5;
                    }
                    if (lcomp[c] < 20) {
                        lcomp[c] += (2 * cd.airs[cn]);
                    }
                    xtrim = (cd.airc[cn] * mcos(car[c].xz) * mlt);
                    ztrim = (cd.airc[cn] * msin(car[c].xz) * mlt);
                } else {
                    if (lcomp[c] > 0) {
                        lcomp[c] -= (2 * cd.airs[cn]);
                    }
                }
                if ((u[c].right) && (!actr[c])) {
                    if (rcomp[c] == 0) {
                        rcomp[c] = 5;
                    }
                    if (rcomp[c] < 20) {
                        rcomp[c] += (2 * cd.airs[cn]);
                    }
                    xtrim = (-cd.airc[cn] * mcos(car[c].xz) * mlt);
                    ztrim = (-cd.airc[cn] * msin(car[c].xz) * mlt);
                } else {
                    if (rcomp[c] > 0) {
                        rcomp[c] -= (2 * cd.airs[cn]);
                    }
                }
                pzy[c] -= ((dcomp[c] - ucomp[c]) * mcos(pxy[c]) * m);
                if (zyinv) {
                    car[c].xz -= ((dcomp[c] - ucomp[c]) * msin(pxy[c]) * m);
                } else {
                    car[c].xz += ((dcomp[c] - ucomp[c]) * msin(pxy[c]) * m);
                }
                pxy[c] += ((rcomp[c] - lcomp[c]) * m);
            } else {
                var upower = power[c];
                if (upower < 40) {
                    upower = 40;
                }
                if (u[c].down) {
                    if (speed[c] > 0) {
                        speed[c] -= ((cd.handb[cn] / 2) * m);
                    } else {
                        var sw = 0;
                        for (var i = 0; i < 2; i++) {
                            if (speed[c] <=  - ((cd.swits[cn][i] / 2) + (upower * cd.swits[cn][i] / 196))) {
                                sw++;
                            }
                        }
                        if (sw != 2) {
                            speed[c] -= (((cd.acelf[cn][sw] / 2) + (upower * cd.acelf[cn][sw] / 196)) * m);
                        } else {
                            speed[c] =  - (((cd.swits[cn][1] / 2) + (upower * cd.swits[cn][1] / 196)) * m);
                        }
                    }
                }
                if (u[c].up) {
                    if (speed[c] < 0) {
                        speed[c] += (cd.handb[cn] * m);
                    } else {
                        var sw = 0;
                        for (var i = 0; i < 3; i++) {
                            if (speed[c] >= ((cd.swits[cn][i] / 2) + (upower * cd.swits[cn][i] / 196))) {
                                sw++;
                            }
                        }
                        if (sw != 3) {
                            speed[c] += (((cd.acelf[cn][sw] / 2) + (upower * cd.acelf[cn][sw] / 196)) * m);
                        } else {
                            speed[c] = ((cd.swits[cn][2] / 2) + (upower * cd.swits[cn][2] / 196));
                        }
                    }
                }
                if (u[c].handb) {
                    if (Math.abs(speed[c]) > cd.handb[cn]) {
                        if (speed[c] < 0) {
                            speed[c] += (cd.handb[cn] * m);
                        } else {
                            speed[c] -= (cd.handb[cn] * m);
                        }
                    }
                }
                if (loop[c] == -1) {
                    if (car[c].y > 15) {
                        if (u[c].left) {
                            if (!pl[c]) {
                                if (lcomp[c] == 0) {
                                    lcomp[c] = (5 * cd.airs[cn]);
                                }
                                if (lcomp[c] < 20) {
                                    lcomp[c] += (2 * cd.airs[cn]);
                                }
                            }
                        } else {
                            if (lcomp[c] > 0) {
                                lcomp[c] -= (2 * cd.airs[cn]);
                            }
                            pl[c] = false;
                        }
                        if (u[c].right) {
                            if (!pr[c]) {
                                if (rcomp[c] == 0) {
                                    rcomp[c] = (5 * cd.airs[cn]);
                                }
                                if (rcomp[c] < 20) {
                                    rcomp[c] += (2 * cd.airs[cn]);
                                }
                            }
                        } else {
                            if (rcomp[c] > 0) {
                                rcomp[c] -= (2 * cd.airs[cn]);
                            }
                            pr[c] = false;
                        }
                        if (u[c].up) {
                            if (!pu[c]) {
                                if (ucomp[c] == 0) {
                                    ucomp[c] = (5 * cd.airs[cn]);
                                }
                                if (ucomp[c] < 20) {
                                    ucomp[c] += (2 * cd.airs[cn]);
                                }
                            }
                        } else {
                            if (ucomp[c] > 0) {
                                ucomp[c] -= (2 * cd.airs[cn]);
                            }
                            pu[c] = false;
                        }
                        if (u[c].down) {
                            if (!pd[c]) {
                                if (dcomp[c] == 0) {
                                    dcomp[c] = (5 * cd.airs[cn]);
                                }
                                if (dcomp[c] < 20) {
                                    dcomp[c] += (2 * cd.airs[cn]);
                                }
                            }
                        } else {
                            if (dcomp[c] > 0) {
                                dcomp[c] -= (2 * cd.airs[cn]);
                            }
                            pd[c] = false;
                        }
                        pzy[c] -= ((dcomp[c] - ucomp[c]) * mcos(pxy[c]) * m);
                        if (zyinv) {
                            car[c].xz -= ((dcomp[c] - ucomp[c]) * msin(pxy[c]) * m);
                        } else {
                            car[c].xz += ((dcomp[c] - ucomp[c]) * msin(pxy[c]) * m);
                        }
                        pxy[c] += ((rcomp[c] - lcomp[c]) * m);
                    }
                }
            }
        }
        var wrots = (200 * speed[c] / (154 * cd.simag[cn]));
        car[c].wzy -= (wrots * m);
        if (car[c].wzy < -360) {
            car[c].wzy += 360;
        }
        if (car[c].wzy > 360) {
            car[c].wzy -= 360;
        }
        if (u[c].left) {
            car[c].wxz -= (cd.turn[cn] * m);
            if (car[c].wxz < -36) {
                car[c].wxz = -36;
            }
        }
        if (u[c].right) {
            car[c].wxz += (cd.turn[cn] * m);
            if (car[c].wxz > 36) {
                car[c].wxz = 36;
            }
        }
        if ((car[c].wxz != 0) && (!u[c].left) && (!u[c].right)) {
            if (Math.abs(speed[c]) < 1) {
                if (Math.abs(car[c].wxz) <= m) {
                    car[c].wxz = 0;
                }
                if (car[c].wxz > 0) {
                    car[c].wxz -= m;
                }
                if (car[c].wxz < 0) {
                    car[c].wxz += m;
                }
            } else {
                if (Math.abs(car[c].wxz) < (cd.turn[cn] * 2 * m)) {
                    car[c].wxz = 0;
                }
                if (car[c].wxz > 0) {
                    car[c].wxz -= (cd.turn[cn] * 2 * m);
                }
                if (car[c].wxz < 0) {
                    car[c].wxz += (cd.turn[cn] * 2 * m);
                }
            }
        }
        var divt = (36 / (speed[c] * speed[c]));
        if (divt < 5) {
            divt = 5;
        }
        if (speed[c] < 0) {
            divt = -divt;
        }
        if (wtouch[c]) {
            if (!capsized[c]) {
                if (!u[c].handb) {
                    fxz[c] = ((car[c].wxz / (divt * 3)) * m);
                } else {
                    fxz[c] = ((car[c].wxz / divt) * m);
                }
                car[c].xz += ((car[c].wxz / divt) * m);
            }
            wtouch[c] = false;
            gtouch[c] = false;
        } else {
            car[c].xz += fxz[c];
        }
        if ((speed[c] > 3) || (speed[c] < -7)) {
            while (Math.abs(mxz[c] - cxz[c]) > 180) {
                if (cxz[c] > mxz[c]) {
                    cxz[c] -= 360;
                } else {
                    if (cxz[c] < mxz[c]) {
                        cxz[c] += 360;
                    }
                }
            }
            if (Math.abs(mxz[c] - cxz[c]) < 30) {
                cxz[c] += ((mxz[c] - cxz[c]) / 4);
            } else {
                if (cxz[c] > mxz[c]) {
                    cxz[c] -= (10 * m);
                }
                if (cxz[c] < mxz[c]) {
                    cxz[c] += (10 * m);
                }
            }
        }
        var kx = [];
        var kz = [];
        var ky = [];
        for (var i = 0; i < 4; i++) {
            kx[i] = (car[c].keyx[i] + car[c].x);
            ky[i] = (keyy + car[c].y);
            kz[i] = (car[c].z + car[c].keyz[i]);
            scy[c][i] -= (0.7 * m);
        }
        rotate(kx, ky, car[c].x, car[c].y, pxy[c], 4);
        rotate(ky, kz, car[c].y, car[c].z, pzy[c], 4);
        rotate(kx, kz, car[c].x, car[c].z, car[c].xz, 4);
        var wastouch = false;
        var arch = 0;
        var avnx = ((scx[c][0] + scx[c][1] + scx[c][2] + scx[c][3]) / 4);
        var avnz = ((scz[c][0] + scz[c][1] + scz[c][2] + scz[c][3]) / 4);
        for (var i = 0; i < 4; i++) {
            if ((scx[c][i] - avnx) > 20) {
                scx[c][i] = (20 + avnx);
            }
            if ((scx[c][i] - avnx) < -20) {
                scx[c][i] = (avnx - 20);
            }
            if ((scz[c][i] - avnz) > 20) {
                scz[c][i] = (20 + avnz);
            }
            if ((scz[c][i] - avnz) < -20) {
                scz[c][i] = (avnz - 20);
            }
        }
        for (var i = 0; i < 4; i++) {
            ky[i] += (scy[c][i] * m);
            kx[i] += (((scx[c][0] + scx[c][1] + scx[c][2] + scx[c][3]) / 4) * m);
            kz[i] += (((scz[c][0] + scz[c][1] + scz[c][2] + scz[c][3]) / 4) * m);
        }
        var tskd = 1;
        var ontsprk = false;
        for (var o = 0; o < nb; o++) {
            if (build[obo[o].typ].skid != -1) {
                var bx = (obo[o].x + (build[obo[o].typ].bx * obo[o].mat[0]) + (build[obo[o].typ].bz * obo[o].mat[8]));
                var sx = (obo[o].x + (build[obo[o].typ].sx * obo[o].mat[0]) + (build[obo[o].typ].sz * obo[o].mat[8]));
                var bz = (obo[o].z + (build[obo[o].typ].bz * obo[o].mat[10]) + (build[obo[o].typ].bx * obo[o].mat[2]));
                var sz = (obo[o].z + (build[obo[o].typ].sz * obo[o].mat[10]) + (build[obo[o].typ].sx * obo[o].mat[2]));
                var intr = 0;
                if (bx > sx) {
                    if ((car[c].x > sx) && (car[c].x < bx)) {
                        intr++;
                    }
                } else {
                    if ((car[c].x > bx) && (car[c].x < sx)) {
                        intr++;
                    }
                }
                if (bz > sz) {
                    if ((car[c].z > sz) && (car[c].z < bz)) {
                        intr++;
                    }
                } else {
                    if ((car[c].z > bz) && (car[c].z < sz)) {
                        intr++;
                    }
                }
                if (intr == 2) {
                    tskd = build[obo[o].typ].skid;
                    ontsprk = true;
                }
            }
        }
        if (mtouch[c]) {
            var ugrip = cd.grip[cn];
            ugrip -= (((Math.abs(txz[c] - car[c].xz) * speed[c]) / 250));
            if (u[c].handb) {
                ugrip -= (Math.abs(txz[c] - car[c].xz) * 4);
            }
            if (ugrip < cd.grip[cn]) {
                if (skid[c] != 2) {
                    skid[c] = 1;
                }
                speed[c] -= ((speed[c] / 100) * m);
            } else {
                if (skid[c] == 1) {
                    skid[c] = 2;
                }
            }
            if (tskd == 1) {
                ugrip *= 0.75;
            }
            if (tskd == 2) {
                ugrip *= 0.55;
            }
            var motorx =  - (speed[c] * msin(car[c].xz) * mcos(pzy[c]));
            var motorz = (speed[c] * mcos(car[c].xz) * mcos(pzy[c]));
            var motory =  - (speed[c] * msin(pzy[c]));
            if (capsized[c] || dest[c] || cp.haltall) {
                motorx = 0;
                motorz = 0;
                motory = 0;
                ugrip = (cd.grip[cn] / 5);
                if (speed[c] > 0) {
                    speed[c] -= (0.2 * m);
                } else {
                    speed[c] += (0.2 * m);
                }
            }
            if (Math.abs(speed[c]) > drag) {
                if (speed[c] > 0) {
                    speed[c] -= (drag * m);
                } else {
                    speed[c] += (drag * m);
                }
            } else {
                speed[c] = 0;
            }
            if (cn == 10) {
                if (ugrip < 0.5) {
                    ugrip = 0.5;
                }
            }
            if (ugrip < 0.1) {
                ugrip = 0.1;
            }
            var avcx = 0,
            avcz = 0;
            for (var i = 0; i < 4; i++) {
                if (Math.abs(scx[c][i] - motorx) > (ugrip * m)) {
                    if (scx[c][i] < motorx) {
                        scx[c][i] += (ugrip * m);
                    } else {
                        scx[c][i] -= (ugrip * m);
                    }
                } else {
                    scx[c][i] = motorx;
                }
                if (Math.abs(scz[c][i] - motorz) > (ugrip * m)) {
                    if (scz[c][i] < motorz) {
                        scz[c][i] += (ugrip * m);
                    } else {
                        scz[c][i] -= (ugrip * m);
                    }
                } else {
                    scz[c][i] = motorz;
                }
                if (Math.abs(scy[c][i] - motory) > (ugrip * m)) {
                    if (scy[c][i] < motory) {
                        scy[c][i] += (ugrip * m);
                    } else {
                        scy[c][i] -= (ugrip * m);
                    }
                } else {
                    scy[c][i] = motory;
                }
                if (frgm >= m) {
                    if (ugrip < cd.grip[cn]) {
                        if (txz[c] != car[c].xz) {
                            dcnt[c]++;
                        } else {
                            if (dcnt[c] != 0) {
                                dcnt[c] = 0;
                            }
                        }
                        if ((dcnt[c] > (40 * ugrip / cd.grip[cn])) || (capsized[c])) {
                            var mag = 1;
                            if (tskd != 0) {
                                mag = 1.2;
                            }
                            if (Math.random() > 0.65) {
                                dustup(tskd, c, i, kx[i], ky[i], kz[i], scx[c][i], scz[c][i], (mag * cd.simag[cn]), tilt[c], ((capsized[c]) && (mtouch[c])));
                                if ((c == 0) && (!capsized[c])) {
                                    skidsnd(tskd, ontsprk, Math.sqrt((scx[c][i] * scx[c][i]) + (scz[c][i] * scz[c][i])));
                                }
                            }
                        } else {
                            if (tskd == 1) {
                                if (Math.random() > 0.8) {
                                    dustup(tskd, c, i, kx[i], ky[i], kz[i], scx[c][i], scz[c][i], (1.1 * cd.simag[cn]), tilt[c], ((capsized[c]) && (mtouch[c])));
                                }
                            }
                            if (tskd == 2) {
                                if (Math.random() > 0.6) {
                                    dustup(tskd, c, i, kx[i], ky[i], kz[i], scx[c][i], scz[c][i], (1.15 * cd.simag[cn]), tilt[c], ((capsized[c]) && (mtouch[c])));
                                }
                            }
                        }
                    } else {
                        if (dcnt[c] != 0) {
                            dcnt[c] -= 2;
                            if (dcnt[c] < 0) {
                                dcnt[c] = 0;
                            }
                        }
                    }
                }
                avcx += scx[c][i];
                avcz += scz[c][i];
            }
            txz[c] = car[c].xz;
            if (avcx > 0) {
                mlt = -1;
            } else {
                mlt = 1;
            }
            if (avcx != 0 || avcz != 0) {
                arch = (avcz / Math.sqrt(((avcx * avcx) + (avcz * avcz))));
            } else {
                arch = 0;
            }
            mxz[c] = ((Math.acos(arch) / 0.017453292519943295) * mlt);
            if (skid[c] == 2) {
                if (!capsized[c]) {
                    avcx = (avcx / 4);
                    avcz = (avcz / 4);
                    if (doublinv) {
                        speed[c] =  - (Math.sqrt((avcx * avcx) + (avcz * avcz)) * mcos(mxz[c] - car[c].xz));
                    } else {
                        speed[c] = (Math.sqrt((avcx * avcx) + (avcz * avcz)) * mcos(mxz[c] - car[c].xz));
                    }
                }
                skid[c] = 0;
            }
            if ((capsized[c]) && (avcx == 0) && (avcz == 0)) {
                tskd = 0;
            }
            mtouch[c] = false;
            wastouch = true;
        } else {
            if (skid[c] != 2) {
                skid[c] = 2;
            }
        }
        var ntr = 0;
        var sprkon = [];
        var onorm = [0, 0];
        for (var i = 0; i < 4; i++) {
            sprkon[i] = 0;
            if (ky[i] < -0.05) {
                ntr++;
                wtouch[c] = true;
                gtouch[c] = true;
                if (!wastouch) {
                    if (scy[c][i] != -0.7) {
                        var mag = (scy[c][i] / 33.33);
                        if (mag > 0.3) {
                            mag = 0.3;
                        }
                        if (tskd == 0) {
                            mag += 1.1;
                        } else {
                            mag += 1.2;
                        }
                        dustup(tskd, c, i, kx[i], ky[i], kz[i], scx[c][i], scz[c][i], (mag * cd.simag[cn]), 0, ((capsized[c]) && (mtouch[c])));
                    }
                }
                ky[i] = 0;
                var bmac = (Math.abs(msin(pxy[c])) + Math.abs(msin(pzy[c])));
                bmac = (bmac / 3);
                if (bmac > 0.4) {
                    bmac = 0.4;
                }
                bmac += cd.bounce[cn];
                if (bmac < 1.1) {
                    bmac = 1.1;
                }
                regn(2, i, Math.abs((scy[c][i] * bmac)), c);
                if (scy[c][i] < 0) {
                    scy[c][i] += Math.abs((scy[c][i] * bmac));
                }
                if (capsized[c]) {
                    if ((ontsprk) && (tskd == 0 || tskd == 1)) {
                        sprkon[i] = 1;
                    } else {
                        sprkon[i] = 2;
                    }
                }
                onorm[Math.floor(i * 0.5)] = 1;
            }
        }
        var zboundr = (Math.abs(cd.boundr[cn] * car[c].mat[10]) + Math.abs(2 * car[c].mat[8]));
        var xboundr = (Math.abs(cd.boundr[cn] * car[c].mat[8]) + Math.abs(2 * car[c].mat[10]));
        var ntron = 0;
        for (var o = 0; o < nb; o++) {
            var ntroff = 0;
            var ntrt = 0;
            if (build[obo[o].typ].intershad || build[obo[o].typ].interact) {
                if ((Math.abs(car[c].x - obo[o].x) < (build[obo[o].typ].colrad + carobj[cn].colrad)) && (Math.abs(car[c].y - obo[o].y) < (build[obo[o].typ].colrad + carobj[cn].colrad)) && (Math.abs(car[c].z - obo[o].z) < (build[obo[o].typ].colrad + carobj[cn].colrad))) {
                    build[obo[o].typ].x = obo[o].x;
                    build[obo[o].typ].y = obo[o].y;
                    build[obo[o].typ].z = obo[o].z;
                    build[obo[o].typ].mat = obo[o].mat;
                    var rad = build[obo[o].typ];
                    var cancelbnd = false;
                    if (obo[o].typ == 33 || obo[o].typ == 34) {
                        cancelbnd = true;
                    }
                    if ((obo[o].typ == 46 || obo[o].typ == 47) && (car[c].y > 70)) {
                        cancelbnd = true;
                    }
                    if ((obo[o].typ == 50 || obo[o].typ == 48) && (car[c].y > 140)) {
                        cancelbnd = true;
                    }
                    if ((obo[o].typ == 49) && (car[c].y > 280)) {
                        cancelbnd = true;
                    }
                    if ((obo[o].typ == 51) && (car[c].y > 310)) {
                        cancelbnd = true;
                    }
                    if ((obo[o].typ == 40) && (car[c].y > 100)) {
                        cancelbnd = true;
                    }
                    var cancelpln = false;
                    if (obo[o].typ == 1) {
                        cancelpln = true;
                    }
                    for (var k = 0; k < 4; k++) {
                        if ((Math.abs(kx[k] - obo[o].x) < obo[o].bx) && (Math.abs(kz[k] - obo[o].z) < obo[o].bz) && (Math.abs(ky[k] - obo[o].y) < obo[o].by)) {
                            var normx = 0,
                            normy = 0,
                            normz = 0;
                            for (var i = 0; i < (rad.ni / 3); i++) {
                                var vertx = [];
                                var verty = [];
                                var vertz = [];
                                for (var v = 0; v < 3; v++) {
                                    var vp = rad.tri[((i * 9) + (v * 3))];
                                    vertx[v] = ( - (rad.vrt[(vp * 3)] * rad.mat[0]) + (rad.vrt[((vp * 3) + 2)] * rad.mat[8]));
                                    verty[v] = rad.vrt[((vp * 3) + 1)];
                                    vertz[v] = ((rad.vrt[((vp * 3) + 2)] * rad.mat[10]) - (rad.vrt[(vp * 3)] * rad.mat[2]));
                                }
                                var vp = rad.tri[((i * 9) + 1)];
                                normx = ( - (rad.nrm[(vp * 3)] * rad.mat[0]) + (rad.nrm[((vp * 3) + 2)] * rad.mat[8]));
                                normy = rad.nrm[((vp * 3) + 1)];
                                normz = ((rad.nrm[((vp * 3) + 2)] * rad.mat[10]) - (rad.nrm[(vp * 3)] * rad.mat[2]));
                                var crx = (kx[k] - rad.x);
                                var cry = ((ky[k] + 7) - rad.y);
                                var crz = (kz[k] - rad.z);
                                if ((Math.abs(normy) < rad.walarc) && (!cancelbnd)) {
                                    var bncbth = false;
                                    if (!rad.interact) {
                                        if (obo[o].typ != 39) {
                                            var verlow = 10000;
                                            for (var j = 0; j < 3; j++) {
                                                if (verty[j] < verlow) {
                                                    verlow = verty[j];
                                                }
                                            }
                                            for (var j = 0; j < 3; j++) {
                                                if (Math.abs(verty[j] - verlow) < 2) {
                                                    verty[j] -= 100;
                                                }
                                            }
                                        } else {
                                            if (i == 43) {
                                                if (Math.abs(normz) == 1) {
                                                    vertx[0] = -vertx[1];
                                                    vertx[2] = -vertx[1];
                                                    for (var j = 0; j < 3; j++) {
                                                        vertz[j] *= 1;
                                                    }
                                                    verty[0] += 50;
                                                    verty[1] = -10;
                                                    verty[2] = -10;
                                                }
                                                if (Math.abs(normx) == 1) {
                                                    vertz[0] = -vertz[1];
                                                    vertz[2] = -vertz[1];
                                                    for (var j = 0; j < 3; j++) {
                                                        vertx[j] *= 1;
                                                    }
                                                    verty[0] += 50;
                                                    verty[1] = -10;
                                                    verty[2] = -10;
                                                }
                                                bncbth = true;
                                            }
                                            if (i == 44) {
                                                if (Math.abs(normz) == 1) {
                                                    vertx[1] = -vertx[0];
                                                    for (var j = 0; j < 3; j++) {
                                                        vertz[j] *= 1;
                                                    }
                                                    verty[1] += 50;
                                                    verty[2] += 50;
                                                    verty[0] = -10;
                                                }
                                                if (Math.abs(normx) == 1) {
                                                    vertz[1] = -vertz[0];
                                                    for (var j = 0; j < 3; j++) {
                                                        vertx[j] *= 1;
                                                    }
                                                    verty[1] += 50;
                                                    verty[2] += 50;
                                                    verty[0] = -10;
                                                }
                                                bncbth = true;
                                            }
                                        }
                                    }
                                    if (Math.abs(normz) > Math.abs(normx)) {
                                        var areaOrig = Math.abs(((vertx[1] - vertx[0]) * (verty[2] - verty[0])) - ((vertx[2] - vertx[0]) * (verty[1] - verty[0])));
                                        var area1 = Math.abs(((vertx[0] - crx) * (verty[1] - cry)) - ((vertx[1] - crx) * (verty[0] - cry)));
                                        var area2 = Math.abs(((vertx[1] - crx) * (verty[2] - cry)) - ((vertx[2] - crx) * (verty[1] - cry)));
                                        var area3 = Math.abs(((vertx[2] - crx) * (verty[0] - cry)) - ((vertx[0] - crx) * (verty[2] - cry)));
                                        if ((area1 + area2 + area3) <= (areaOrig + 10)) {
                                            var fct = 0;
                                            if ((verty[0] - verty[1]) != 0) {
                                                fct = ((ky[k] - (verty[1] + rad.y)) / (verty[0] - verty[1]));
                                            } else {
                                                fct = 0;
                                            }
                                            var lx = (vertx[1] + ((vertx[0] - vertx[1]) * fct));
                                            var lz = (vertz[1] + ((vertz[0] - vertz[1]) * fct));
                                            if ((verty[0] - verty[2]) != 0) {
                                                fct = ((ky[k] - (verty[2] + rad.y)) / (verty[0] - verty[2]));
                                            } else {
                                                fct = 0;
                                            }
                                            var tx = (vertx[2] + ((vertx[0] - vertx[2]) * fct));
                                            var tz = (vertz[2] + ((vertz[0] - vertz[2]) * fct));
                                            if ((tx - lx) != 0) {
                                                fct = ((kx[k] - (lx + rad.x)) / (tx - lx));
                                            } else {
                                                fct = 0;
                                            }
                                            var colz = ((lz + rad.z) + ((tz - lz) * fct));
                                            if ((obo[o].bnd[0] != 1) && (normz > 0) && (kz[k] < (colz + zboundr)) && (kz[k] > (colz + zboundr - rad.bndmax)) && (scz[c][k] <= 1.2 || bncbth)) {
                                                for (var j = 0; j < 4; j++) {
                                                    if (k != j) {
                                                        if (kz[j] >= (colz + zboundr)) {
                                                            kz[j] -= (kz[k] - (colz + zboundr));
                                                        }
                                                    }
                                                }
                                                kz[k] = (colz + zboundr);
                                                if (frgm >= m) {
                                                    crank[c][k]++;
                                                    if (crank[c][k] > 2) {
                                                        sprks(cn, kx[k], ky[k], (kz[k] - zboundr), scx[c][k], scy[c][k], scz[c][k], 2);
                                                        if (c == 0) {
                                                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                                                        }
                                                    }
                                                }
                                                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                                                bmac = (bmac / 4);
                                                if (bmac > 0.3) {
                                                    bmac = 0.3;
                                                }
                                                if (wastouch) {
                                                    bmac = 0;
                                                }
                                                bmac += (cd.bounce[cn] - 0.2);
                                                if (bmac < 1.1) {
                                                    bmac = 1.1;
                                                }
                                                regn(1, k, Math.abs((scz[c][k] * bmac * rad.dam)), c);
                                                if (scz[c][k] <= 0) {
                                                    scz[c][k] += Math.abs((scz[c][k] * bmac));
                                                }
                                                skid[c] = 2;
                                                spinlocate = true;
                                                uwall[c] = true;
                                                if ((obo[o].typ != 35) && (obo[o].typ != 36) && (obo[o].typ != 39 || cp.stage == 13) && (obo[o].typ != 20 || cp.stage != 14) && (obo[o].typ != 1 || cp.stage != 16)) {
                                                    wall[c] = o;
                                                }
                                            }
                                            if ((obo[o].bnd[1] != 1) && (normz < 0) && (kz[k] > (colz - zboundr)) && (kz[k] < (colz - zboundr + rad.bndmax)) && (scz[c][k] >= -1.2 || bncbth)) {
                                                for (var j = 0; j < 4; j++) {
                                                    if (k != j) {
                                                        if (kz[j] <= (colz - zboundr)) {
                                                            kz[j] -= (kz[k] - (colz - zboundr));
                                                        }
                                                    }
                                                }
                                                kz[k] = (colz - zboundr);
                                                if (frgm >= m) {
                                                    crank[c][k]++;
                                                    if (crank[c][k] > 2) {
                                                        sprks(cn, kx[k], ky[k], (kz[k] + zboundr), scx[c][k], scy[c][k], scz[c][k], 2);
                                                        if (c == 0) {
                                                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                                                        }
                                                    }
                                                }
                                                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                                                bmac = (bmac / 4);
                                                if (bmac > 0.3) {
                                                    bmac = 0.3;
                                                }
                                                if (wastouch) {
                                                    bmac = 0;
                                                }
                                                bmac += (cd.bounce[cn] - 0.2);
                                                if (bmac < 1.1) {
                                                    bmac = 1.1;
                                                }
                                                regn(1, k, -Math.abs((scz[c][k] * bmac * rad.dam)), c);
                                                if (scz[c][k] >= 0) {
                                                    scz[c][k] -= Math.abs((scz[c][k] * bmac));
                                                }
                                                skid[c] = 2;
                                                spinlocate = true;
                                                uwall[c] = true;
                                                if ((obo[o].typ != 35) && (obo[o].typ != 36) && (obo[o].typ != 39 || cp.stage == 13) && (obo[o].typ != 20 || cp.stage != 14) && (obo[o].typ != 1 || cp.stage != 16)) {
                                                    wall[c] = o;
                                                }
                                            }
                                        }
                                    } else {
                                        var areaOrig = Math.abs(((verty[1] - verty[0]) * (vertz[2] - vertz[0])) - ((verty[2] - verty[0]) * (vertz[1] - vertz[0])));
                                        var area1 = Math.abs(((verty[0] - cry) * (vertz[1] - crz)) - ((verty[1] - cry) * (vertz[0] - crz)));
                                        var area2 = Math.abs(((verty[1] - cry) * (vertz[2] - crz)) - ((verty[2] - cry) * (vertz[1] - crz)));
                                        var area3 = Math.abs(((verty[2] - cry) * (vertz[0] - crz)) - ((verty[0] - cry) * (vertz[2] - crz)));
                                        if ((area1 + area2 + area3) <= (areaOrig + 10)) {
                                            var fct = 0;
                                            if ((vertz[0] - vertz[1]) != 0) {
                                                fct = ((kz[k] - (vertz[1] + rad.z)) / (vertz[0] - vertz[1]));
                                            } else {
                                                fct = 0;
                                            }
                                            var lx = (vertx[1] + ((vertx[0] - vertx[1]) * fct));
                                            var ly = (verty[1] + ((verty[0] - verty[1]) * fct));
                                            if ((vertz[0] - vertz[2]) != 0) {
                                                fct = ((kz[k] - (vertz[2] + rad.z)) / (vertz[0] - vertz[2]));
                                            } else {
                                                fct = 0;
                                            }
                                            var tx = (vertx[2] + ((vertx[0] - vertx[2]) * fct));
                                            var ty = (verty[2] + ((verty[0] - verty[2]) * fct));
                                            if ((ty - ly) != 0) {
                                                fct = ((ky[k] - (ly + rad.y)) / (ty - ly));
                                            } else {
                                                fct = 0;
                                            }
                                            var colx = ((lx + rad.x) + ((tx - lx) * fct));
                                            if ((obo[o].bnd[2] != 1) && (normx > 0) && (kx[k] < (colx + xboundr)) && (kx[k] > (colx + xboundr - rad.bndmax)) && (scx[c][k] <= 1.2 || bncbth)) {
                                                for (var j = 0; j < 4; j++) {
                                                    if (k != j) {
                                                        if (kx[j] >= (colx + xboundr)) {
                                                            kx[j] -= (kx[k] - (colx + xboundr));
                                                        }
                                                    }
                                                }
                                                kx[k] = (colx + xboundr);
                                                if (frgm >= m) {
                                                    crank[c][k]++;
                                                    if (crank[c][k] > 2) {
                                                        sprks(cn, (kx[k] - xboundr), ky[k], kz[k], scx[c][k], scy[c][k], scz[c][k], 2);
                                                        if (c == 0) {
                                                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                                                        }
                                                    }
                                                }
                                                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                                                bmac = (bmac / 4);
                                                if (bmac > 0.3) {
                                                    bmac = 0.3;
                                                }
                                                if (wastouch) {
                                                    bmac = 0;
                                                }
                                                bmac += (cd.bounce[cn] - 0.2);
                                                if (bmac < 1.1) {
                                                    bmac = 1.1;
                                                }
                                                regn(0, k, Math.abs((scx[c][k] * bmac * rad.dam)), c);
                                                if (scx[c][k] <= 0) {
                                                    scx[c][k] += Math.abs((scx[c][k] * bmac));
                                                }
                                                skid[c] = 2;
                                                spinlocate = true;
                                                uwall[c] = true;
                                                if ((obo[o].typ != 35) && (obo[o].typ != 36) && (obo[o].typ != 39 || cp.stage == 13) && (obo[o].typ != 1 || cp.stage != 16)) {
                                                    wall[c] = o;
                                                }
                                            }
                                            if ((obo[o].bnd[3] != 1) && (normx < 0) && (kx[k] > (colx - xboundr)) && (kx[k] < (colx - xboundr + rad.bndmax)) && (scx[c][k] >= -1.2 || bncbth)) {
                                                for (var j = 0; j < 4; j++) {
                                                    if (k != j) {
                                                        if (kx[j] <= (colx - xboundr)) {
                                                            kx[j] -= (kx[k] - (colx - xboundr));
                                                        }
                                                    }
                                                }
                                                kx[k] = (colx - xboundr);
                                                if (frgm >= m) {
                                                    crank[c][k]++;
                                                    if (crank[c][k] > 2) {
                                                        sprks(cn, (kx[k] + xboundr), ky[k], kz[k], scx[c][k], scy[c][k], scz[c][k], 2);
                                                        if (c == 0) {
                                                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                                                        }
                                                    }
                                                }
                                                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                                                bmac = (bmac / 4);
                                                if (bmac > 0.3) {
                                                    bmac = 0.3;
                                                }
                                                if (wastouch) {
                                                    bmac = 0;
                                                }
                                                bmac += (cd.bounce[cn] - 0.2);
                                                if (bmac < 1.1) {
                                                    bmac = 1.1;
                                                }
                                                regn(0, k, -Math.abs((scx[c][k] * bmac * rad.dam)), c);
                                                if (scx[c][k] >= 0) {
                                                    scx[c][k] -= Math.abs((scx[c][k] * bmac));
                                                }
                                                skid[c] = 2;
                                                spinlocate = true;
                                                uwall[c] = true;
                                                if ((obo[o].typ != 35) && (obo[o].typ != 36) && (obo[o].typ != 39 || cp.stage == 13) && (obo[o].typ != 1 || cp.stage != 16)) {
                                                    wall[c] = o;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (obo[o].typ == 26) {
                                    normy = Math.abs(normy);
                                }
                                if ((normy > 0.4) && (!cancelpln)) {
                                    var areaOrig = Math.abs(((vertx[1] - vertx[0]) * (vertz[2] - vertz[0])) - ((vertx[2] - vertx[0]) * (vertz[1] - vertz[0])));
                                    var area1 = Math.abs(((vertx[0] - crx) * (vertz[1] - crz)) - ((vertx[1] - crx) * (vertz[0] - crz)));
                                    var area2 = Math.abs(((vertx[1] - crx) * (vertz[2] - crz)) - ((vertx[2] - crx) * (vertz[1] - crz)));
                                    var area3 = Math.abs(((vertx[2] - crx) * (vertz[0] - crz)) - ((vertx[0] - crx) * (vertz[2] - crz)));
                                    if ((area1 + area2 + area3) <= (areaOrig + 10)) {
                                        var fct = 0;
                                        if ((vertz[0] - vertz[1]) != 0) {
                                            fct = ((kz[k] - (vertz[1] + rad.z)) / (vertz[0] - vertz[1]));
                                        } else {
                                            fct = 0;
                                        }
                                        var lx = (vertx[1] + ((vertx[0] - vertx[1]) * fct));
                                        var ly = (verty[1] + ((verty[0] - verty[1]) * fct));
                                        if ((vertz[0] - vertz[2]) != 0) {
                                            fct = ((kz[k] - (vertz[2] + rad.z)) / (vertz[0] - vertz[2]));
                                        } else {
                                            fct = 0;
                                        }
                                        var tx = (vertx[2] + ((vertx[0] - vertx[2]) * fct));
                                        var ty = (verty[2] + ((verty[0] - verty[2]) * fct));
                                        if ((tx - lx) != 0) {
                                            fct = ((kx[k] - (lx + rad.x)) / (tx - lx));
                                        } else {
                                            fct = 0;
                                        }
                                        var coly = ((ly + rad.y) + ((ty - ly) * fct));
                                        if (Math.abs(normy) == 1) {
                                            if ((ky[k] < (coly - 0.05)) && (ky[k] > (coly - 20))) {
                                                ntrt++;
                                                wtouch[c] = true;
                                                gtouch[c] = true;
                                                if (!wastouch) {
                                                    if (scy[c][k] != -0.7) {
                                                        var mag = (scy[c][k] / 33.33);
                                                        if (mag > 0.3) {
                                                            mag = 0.3;
                                                        }
                                                        if (tskd == 0) {
                                                            mag += 1.1;
                                                        } else {
                                                            mag += 1.2;
                                                        }
                                                        dustup(tskd, c, k, kx[k], ky[k], kz[k], scx[c][k], scz[c][k], (mag * cd.simag[cn]), 0, ((capsized[c]) && (mtouch[c])));
                                                    }
                                                }
                                                ky[k] = coly;
                                                if (capsized[c]) {
                                                    if ((ontsprk) && (tskd == 0 || tskd == 1)) {
                                                        sprkon[k] = 1;
                                                    } else {
                                                        sprkon[k] = 2;
                                                    }
                                                }
                                                var bmac = (Math.abs(msin(pxy[c])) + Math.abs(msin(pzy[c])));
                                                bmac = (bmac / 3);
                                                if (bmac > 0.4) {
                                                    bmac = 0.4;
                                                }
                                                bmac += cd.bounce[cn];
                                                if (bmac < 1.1) {
                                                    bmac = 1.1;
                                                }
                                                regn(2, k, Math.abs((scy[c][k] * bmac)), c);
                                                if (scy[c][k] < 0) {
                                                    scy[c][k] += Math.abs((scy[c][k] * bmac));
                                                }
                                                onorm[Math.floor(k * 0.5)] = 1;
                                            }
                                        } else {
                                            if ((ty - ly) != 0) {
                                                fct = ((ky[k] - (ly + rad.y)) / (ty - ly));
                                            } else {
                                                fct = 0;
                                            }
                                            var colx = ((lx + rad.x) + ((tx - lx) * fct));
                                            fct = 0;
                                            if ((verty[0] - verty[1]) != 0) {
                                                fct = ((ky[k] - (verty[1] + rad.y)) / (verty[0] - verty[1]));
                                            } else {
                                                fct = 0;
                                            }
                                            lx = (vertx[1] + ((vertx[0] - vertx[1]) * fct));
                                            var lz = (vertz[1] + ((vertz[0] - vertz[1]) * fct));
                                            if ((verty[0] - verty[2]) != 0) {
                                                fct = ((ky[k] - (verty[2] + rad.y)) / (verty[0] - verty[2]));
                                            } else {
                                                fct = 0;
                                            }
                                            tx = (vertx[2] + ((vertx[0] - vertx[2]) * fct));
                                            var tz = (vertz[2] + ((vertz[0] - vertz[2]) * fct));
                                            if ((tx - lx) != 0) {
                                                fct = ((kx[k] - (lx + rad.x)) / (tx - lx));
                                            } else {
                                                fct = 0;
                                            }
                                            var colz = ((lz + rad.z) + ((tz - lz) * fct));
                                            if ((ky[k] < coly) && (ky[k] > (coly - 20))) {
                                                var bounceramp = false;
                                                if (Math.abs(normz) > Math.abs(normx)) {
                                                    if (((normz > 0) && (scz[c][k] < 0)) || ((normz < 0) && (scz[c][k] > 0))) {
                                                        bounceramp = true;
                                                    }
                                                } else {
                                                    if (((normx > 0) && (scx[c][k] < 0)) || ((normx < 0) && (scx[c][k] > 0))) {
                                                        bounceramp = true;
                                                    }
                                                }
                                                if (bounceramp) {
                                                    var bmac = (Math.abs(msin(pxy[c])) + Math.abs(msin(pzy[c])));
                                                    bmac = (bmac / 3);
                                                    if (bmac > 0.4) {
                                                        bmac = 0.4;
                                                    }
                                                    bmac += cd.bounce[cn];
                                                    if (bmac < 1.1) {
                                                        bmac = 1.1;
                                                    }
                                                    if (scy[c][k] < 0) {
                                                        scy[c][k] += Math.abs(scy[c][k] * bmac);
                                                    }
                                                    if (obo[o].typ == 39) {
                                                        for (var ka = 0; ka < 4; ka++) {
                                                            if (Math.abs(normz) > Math.abs(normx)) {
                                                                if (normz > 0) {
                                                                    scz[c][ka] += Math.abs(scy[c][k] * bmac * 0.4);
                                                                } else {
                                                                    scz[c][ka] -= Math.abs(scy[c][k] * bmac * 0.4);
                                                                }
                                                            } else {
                                                                if (normx > 0) {
                                                                    scx[c][ka] += Math.abs(scy[c][k] * bmac * 0.4);
                                                                } else {
                                                                    scx[c][ka] -= Math.abs(scy[c][k] * bmac * 0.4);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                var trzy = (Math.acos(Math.abs(normy)) / 0.017453292519943295);
                                                var arct = (1 + ((50 - Math.abs(trzy)) / 30));
                                                if (arct < 1) {
                                                    arct = 1;
                                                }
                                                var difco = ((coly - ky[k]) / (arct * m));
                                                scy[c][k] += difco;
                                                ky[k] = coly;
                                                if (difco > 0) {
                                                    difco *= 20;
                                                    difco = (100 - difco);
                                                    if (difco < 2) {
                                                        difco = 2;
                                                    }
                                                    if (Math.abs(normz) > Math.abs(normx)) {
                                                        if (Math.abs((colz - kz[k])) < 100) {
                                                            kz[k] += ((colz - kz[k]) / difco);
                                                        }
                                                    } else {
                                                        if (Math.abs((colx - kx[k])) < 100) {
                                                            kx[k] += ((colx - kx[k]) / difco);
                                                        }
                                                    }
                                                }
                                                if (tskd == 2) {
                                                    ntroff++;
                                                } else {
                                                    ntron++;
                                                }
                                                wtouch[c] = true;
                                                gtouch[c] = false;
                                                if (capsized[c]) {
                                                    if ((ontsprk) && (tskd == 0 || tskd == 1)) {
                                                        sprkon[k] = 1;
                                                    } else {
                                                        sprkon[k] = 2;
                                                    }
                                                }
                                                if (!wastouch) {
                                                    if (tskd != 0) {
                                                        var mag = 1.4;
                                                        dustup(tskd, c, i, kx[i], ky[i], kz[i], scx[c][i], scz[c][i], (mag * cd.simag[cn]), 0, ((capsized[c]) && (mtouch[c])));
                                                    }
                                                }
                                                onorm[Math.floor(k * 0.5)] = normy;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (ntroff == 4) {
                mtouch[c] = true;
            }
            if (ntrt == 4) {
                ntr = 4;
            }
        }
        if (ntron == 4) {
            mtouch[c] = true;
        }
        if (c == 0) {
            for (var i = 0; i < 2; i++) {
                if (lonorm[i] != onorm[i]) {
                    if ((lonorm[i] > 0) && (onorm[i] > 0)) {
                        if (Math.abs(lonorm[i] - onorm[i]) > 0.015) {
                            bumpsnd(i, Math.sqrt((avnx * avnx) + (avnz * avnz)), tskd);
                        }
                    }
                    lonorm[i] = onorm[i];
                }
            }
        }
        if (frgm >= m) {
            var allsparks = 0;
            for (var k = 0; k < 4; k++) {
                if (sprkon[k] == 1) {
                    allsparks++;
                }
            }
            if (allsparks != 4) {
                for (var k = 0; k < 4; k++) {
                    if (sprkon[k] == 1) {
                        sprks(cn, kx[k], ky[k], kz[k], scx[c][k], scy[c][k], scz[c][k], 1);
                    }
                    if ((c == 0) && (sprkon[k])) {
                        grndscrapesnd(sprkon[k], scx[c][k], scy[c][k], scz[c][k]);
                    }
                }
            } else {
                var k = Math.floor(Math.random() * 4);
                if (k == 4) {
                    k = 0;
                }
                sprks(cn, ((kx[k] + car[c].x) / 2), ky[k], ((kz[k] + car[c].z) / 2), scx[c][k], scy[c][k], scz[c][k], 1);
                k = Math.floor(Math.random() * 4);
                if (k == 4) {
                    k = 0;
                }
                sprks(cn, ((kx[k] + car[c].x) / 2), ky[k], ((kz[k] + car[c].z) / 2), scx[c][k], scy[c][k], scz[c][k], 1);
                if (c == 0) {
                    grndscrapesnd(1, scx[c][k], scy[c][k], scz[c][k]);
                }
            }
        }
        for (var k = 0; k < 4; k++) {
            if ((kz[k] < (limb + zboundr)) && (kz[k] > (limb + zboundr - 20))) {
                for (var j = 0; j < 4; j++) {
                    if (k != j) {
                        if (kz[j] >= (limb + zboundr)) {
                            kz[j] -= (kz[k] - (limb + zboundr));
                        }
                    }
                }
                kz[k] = (limb + zboundr);
                if ((frgm >= m) && (ky[k] < 20)) {
                    crank[c][k]++;
                    if (crank[c][k] > 2) {
                        sprks(cn, kx[k], ky[k], (kz[k] - zboundr), scx[c][k], scy[c][k], scz[c][k], 2);
                        if (c == 0) {
                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                        }
                    }
                }
                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                bmac = (bmac / 4);
                if (bmac > 0.3) {
                    bmac = 0.3;
                }
                if (wastouch) {
                    bmac = 0;
                }
                bmac += (cd.bounce[cn] - 0.2);
                if (bmac < 1.1) {
                    bmac = 1.1;
                }
                regn(1, k, Math.abs((scz[c][k] * bmac)), c);
                if (scz[c][k] <= 0) {
                    scz[c][k] += Math.abs((scz[c][k] * bmac));
                }
                skid[c] = 2;
                spinlocate = true;
                wall[c] = limbo;
            }
            if ((kz[k] > (limt - zboundr)) && (kz[k] < (limt - zboundr + 20))) {
                for (var j = 0; j < 4; j++) {
                    if (k != j) {
                        if (kz[j] <= (limt - zboundr)) {
                            kz[j] -= (kz[k] - (limt - zboundr));
                        }
                    }
                }
                kz[k] = (limt - zboundr);
                if ((frgm >= m) && (ky[k] < 20)) {
                    crank[c][k]++;
                    if (crank[c][k] > 2) {
                        sprks(cn, kx[k], ky[k], (kz[k] + zboundr), scx[c][k], scy[c][k], scz[c][k], 2);
                        if (c == 0) {
                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                        }
                    }
                }
                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                bmac = (bmac / 4);
                if (bmac > 0.3) {
                    bmac = 0.3;
                }
                if (wastouch) {
                    bmac = 0;
                }
                bmac += (cd.bounce[cn] - 0.2);
                if (bmac < 1.1) {
                    bmac = 1.1;
                }
                regn(1, k, -Math.abs((scz[c][k] * bmac)), c);
                if (scz[c][k] >= 0) {
                    scz[c][k] -= Math.abs((scz[c][k] * bmac));
                }
                skid[c] = 2;
                spinlocate = true;
                wall[c] = limto;
            }
            if ((kx[k] < (limr + xboundr)) && (kx[k] > (limr + xboundr - 20))) {
                for (var j = 0; j < 4; j++) {
                    if (k != j) {
                        if (kx[j] >= (limr + xboundr)) {
                            kx[j] -= (kx[k] - (limr + xboundr));
                        }
                    }
                }
                kx[k] = (limr + xboundr);
                if ((frgm >= m) && (ky[k] < 20)) {
                    crank[c][k]++;
                    if (crank[c][k] > 2) {
                        sprks(cn, (kx[k] - xboundr), ky[k], kz[k], scx[c][k], scy[c][k], scz[c][k], 2);
                        if (c == 0) {
                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                        }
                    }
                }
                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                bmac = (bmac / 4);
                if (bmac > 0.3) {
                    bmac = 0.3;
                }
                if (wastouch) {
                    bmac = 0;
                }
                bmac += (cd.bounce[cn] - 0.2);
                if (bmac < 1.1) {
                    bmac = 1.1;
                }
                regn(0, k, Math.abs((scx[c][k] * bmac)), c);
                if (scx[c][k] <= 0) {
                    scx[c][k] += Math.abs((scx[c][k] * bmac));
                }
                skid[c] = 2;
                spinlocate = true;
                wall[c] = limro;
            }
            if ((kx[k] > (liml - xboundr)) && (kx[k] < (liml - xboundr + 20))) {
                for (var j = 0; j < 4; j++) {
                    if (k != j) {
                        if (kx[j] <= (liml - xboundr)) {
                            kx[j] -= (kx[k] - (liml - xboundr));
                        }
                    }
                }
                kx[k] = (liml - xboundr);
                if ((frgm >= m) && (ky[k] < 20)) {
                    crank[c][k]++;
                    if (crank[c][k] > 2) {
                        sprks(cn, (kx[k] + xboundr), ky[k], kz[k], scx[c][k], scy[c][k], scz[c][k], 2);
                        if (c == 0) {
                            scrapesnd(scx[c][k], scy[c][k], scz[c][k]);
                        }
                    }
                }
                var bmac = (Math.abs(mcos(pxy[c])) + Math.abs(mcos(pzy[c])));
                bmac = (bmac / 4);
                if (bmac > 0.3) {
                    bmac = 0.3;
                }
                if (wastouch) {
                    bmac = 0;
                }
                bmac += (cd.bounce[cn] - 0.2);
                if (bmac < 1.1) {
                    bmac = 1.1;
                }
                regn(0, k, -Math.abs((scx[c][k] * bmac)), c);
                if (scx[c][k] >= 0) {
                    scx[c][k] -= Math.abs((scx[c][k] * bmac));
                }
                skid[c] = 2;
                spinlocate = true;
                wall[c] = limlo;
            }
        }
        if (frgm >= m) {
            for (var i = 0; i < 4; i++) {
                if (crank[c][i] == lcrank[c][i]) {
                    crank[c][i][k] = 0;
                }
                lcrank[c][i] = crank[c][i];
            }
        }
        var nzy = 0,
        nzyr = 0,
        nxy = 0,
        nxyr = 0;
        if (scy[c][2] != scy[c][0]) {
            if (scy[c][2] < scy[c][0]) {
                mlt = -1;
            } else {
                mlt = 1;
            }
            arch = (Math.sqrt(((kz[0] - kz[2]) * (kz[0] - kz[2]) + (ky[0] - ky[2]) * (ky[0] - ky[2]) + (kx[0] - kx[2]) * (kx[0] - kx[2]))) / (Math.abs(car[c].keyz[0]) + Math.abs(car[c].keyz[2])));
            if (arch >= 0.9998) {
                nzy = mlt;
            } else {
                nzy = ((Math.acos(arch) / 0.017453292519943295) * mlt);
            }
        }
        if (scy[c][3] != scy[c][1]) {
            if (scy[c][3] < scy[c][1]) {
                mlt = -1;
            } else {
                mlt = 1;
            }
            arch = (Math.sqrt(((kz[1] - kz[3]) * (kz[1] - kz[3]) + (ky[1] - ky[3]) * (ky[1] - ky[3]) + (kx[1] - kx[3]) * (kx[1] - kx[3]))) / (Math.abs(car[c].keyz[1]) + Math.abs(car[c].keyz[3])));
            if (arch >= 0.9998) {
                nzyr = mlt;
            } else {
                nzyr = ((Math.acos(arch) / 0.017453292519943295) * mlt);
            }
        }
        if (scy[c][1] != scy[c][0]) {
            if (scy[c][1] < scy[c][0]) {
                mlt = -1;
            } else {
                mlt = 1;
            }
            arch = (Math.sqrt(((kz[0] - kz[1]) * (kz[0] - kz[1]) + (ky[0] - ky[1]) * (ky[0] - ky[1]) + (kx[0] - kx[1]) * (kx[0] - kx[1]))) / (Math.abs(car[c].keyx[0]) + Math.abs(car[c].keyx[1])));
            if (arch >= 0.9998) {
                nxy = mlt;
            } else {
                nxy = ((Math.acos(arch) / 0.017453292519943295) * mlt);
            }
        }
        if (scy[c][3] != scy[c][2]) {
            if (scy[c][3] < scy[c][2]) {
                mlt = -1;
            } else {
                mlt = 1;
            }
            arch = (Math.sqrt(((kz[2] - kz[3]) * (kz[2] - kz[3]) + (ky[2] - ky[3]) * (ky[2] - ky[3]) + (kx[2] - kx[3]) * (kx[2] - kx[3]))) / (Math.abs(car[c].keyx[2]) + Math.abs(car[c].keyx[3])));
            if (arch >= 0.9998) {
                nxyr = mlt;
            } else {
                nxyr = ((Math.acos(arch) / 0.017453292519943295) * mlt);
            }
        }
        if (spinlocate) {
            var dxz = Math.abs(car[c].xz + 45);
            while (dxz > 180) {
                dxz -= 360;
            }
            if (Math.abs(dxz) > 90) {
                pmlt[c] = 1;
            } else {
                pmlt[c] = -1;
            }
            dxz = Math.abs(car[c].xz - 45);
            while (dxz > 180) {
                dxz -= 360;
            }
            if (Math.abs(dxz) > 90) {
                nmlt[c] = 1;
            } else {
                nmlt[c] = -1;
            }
        }
        car[c].xz += (forca[c] * 10 * m * ((scz[c][0] * nmlt[c]) - (scz[c][1] * pmlt[c]) + (scz[c][2] * pmlt[c]) - (scz[c][3] * nmlt[c]) + (scx[c][0] * pmlt[c]) + (scx[c][1] * nmlt[c]) - (scx[c][2] * nmlt[c]) - (scx[c][3] * pmlt[c])));
        if (Math.abs(nzyr) > Math.abs(nzy)) {
            nzy = nzyr;
        }
        if (Math.abs(nxyr) > Math.abs(nxy)) {
            nxy = nxyr;
        }
        if (!zyinv) {
            pzy[c] += (nzy * m);
        } else {
            pzy[c] -= (nzy * m);
        }
        if (!xyinv) {
            pxy[c] += (nxy * m);
        } else {
            pxy[c] -= (nxy * m);
        }
        if (ntr == 4) {
            var tat = 0;
            while (pzy[c] < 360) {
                pzy[c] += 360;
                car[c].zy += 360;
            }
            while (pzy[c] > 360) {
                pzy[c] -= 360;
                car[c].zy -= 360;
            }
            if ((pzy[c] < 190) && (pzy[c] > 170)) {
                pzy[c] = 180;
                car[c].zy = 180;
                tat++;
            }
            if ((pzy[c] > 350) || (pzy[c] < 10)) {
                pzy[c] = 0;
                car[c].zy = 0;
                tat++;
            }
            while (pxy[c] < 360) {
                pxy[c] += 360;
                car[c].xy += 360;
            }
            while (pxy[c] > 360) {
                pxy[c] -= 360;
                car[c].xy -= 360;
            }
            if ((pxy[c] < 190) && (pxy[c] > 170)) {
                pxy[c] = 180;
                car[c].xy = 180;
                tat++;
            }
            if ((pxy[c] > 350) || (pxy[c] < 10)) {
                pxy[c] = 0;
                car[c].xy = 0;
                tat++;
            }
            if (tat == 2) {
                mtouch[c] = true;
            }
        }
        if (frgm >= m) {
            if ((!mtouch[c]) && (wtouch[c])) {
                if (cntouch[c] == 10) {
                    mtouch[c] = true;
                } else {
                    cntouch[c]++;
                }
            } else {
                cntouch[c] = 0;
            }
        }
        car[c].y = (((ky[0] + ky[1] + ky[2] + ky[3]) / 4) - (keyy * mcos(pzy[c]) * mcos(pxy[c])) + (ytrim * m));
        if (zyinv) {
            mlt = -1;
        } else {
            mlt = 1;
        }
        car[c].x = (((kx[0] - (car[c].keyx[0] * mcos(car[c].xz)) + (mlt * car[c].keyz[0] * msin(car[c].xz)) + kx[1] - (car[c].keyx[1] * mcos(car[c].xz)) + (mlt * car[c].keyz[1] * msin(car[c].xz)) + kx[2] - (car[c].keyx[2] * mcos(car[c].xz)) + (mlt * car[c].keyz[2] * msin(car[c].xz)) + kx[3] - (car[c].keyx[3] * mcos(car[c].xz)) + (mlt * car[c].keyz[3] * msin(car[c].xz))) / 4) + (keyy * msin(pxy[c]) * mcos(car[c].xz)) - (keyy * msin(pzy[c]) * msin(car[c].xz)) + (xtrim * m));
        car[c].z = (((kz[0] - (mlt * car[c].keyz[0] * mcos(car[c].xz)) - (car[c].keyx[0] * msin(car[c].xz)) + kz[1] - (mlt * car[c].keyz[1] * mcos(car[c].xz)) - (car[c].keyx[1] * msin(car[c].xz)) + kz[2] - (mlt * car[c].keyz[2] * mcos(car[c].xz)) - (car[c].keyx[2] * msin(car[c].xz)) + kz[3] - (mlt * car[c].keyz[3] * mcos(car[c].xz)) - (car[c].keyx[3] * msin(car[c].xz))) / 4) + (keyy * msin(pxy[c]) * msin(car[c].xz)) - (keyy * msin(pzy[c]) * mcos(car[c].xz)) + (ztrim * m));
        if ((Math.abs(speed[c]) > 10) || (!mtouch[c])) {
            if (Math.abs(pxy[c] - car[c].xy) >= (4 * m)) {
                if (pxy[c] > car[c].xy) {
                    car[c].xy += ((2 * m) + ((pxy[c] - car[c].xy) / 2));
                } else {
                    car[c].xy -= ((2 * m) + ((car[c].xy - pxy[c]) / 2));
                }
            } else {
                car[c].xy = pxy[c];
            }
            if (Math.abs(pzy[c] - car[c].zy) >= (4 * m)) {
                if (pzy[c] > car[c].zy) {
                    car[c].zy += ((2 * m) + ((pzy[c] - car[c].zy) / 2));
                } else {
                    car[c].zy -= ((2 * m) + ((car[c].zy - pzy[c]) / 2));
                }
            } else {
                car[c].zy = pzy[c];
            }
        }
        if ((wtouch[c]) && (!capsized[c])) {
            var mtilt = ((speed[c] / cd.swits[cn][2]) * 14 * (cd.bounce[cn] - 0.4));
            if ((u[c].left) && (tilt[c] < mtilt) && (tilt[c] >= 0)) {
                tilt[c] += (0.4 * m);
            } else {
                if ((u[c].right) && (tilt[c] > -mtilt) && (tilt[c] <= 0)) {
                    tilt[c] -= (0.4 * m);
                } else {
                    if (Math.abs(tilt[c]) > (3 * (cd.bounce[cn] - 0.4))) {
                        if (tilt[c] > 0) {
                            tilt[c] -= (3 * (cd.bounce[cn] - 0.3));
                        } else {
                            tilt[c] += (3 * (cd.bounce[cn] - 0.3));
                        }
                    } else {
                        tilt[c] = 0;
                    }
                }
            }
            car[c].xy += tilt[c];
            if (gtouch[c]) {
                car[c].y -= ((Math.abs(tilt[c]) / 30) * m);
            }
        } else {
            if (tilt[c] != 0) {
                tilt[c] = 0;
            }
        }
        if (frgm >= m) {
            if ((mtouch[c]) && (tskd == 2)) {
                car[c].zy += (((Math.random() * 5 * speed[c] / cd.swits[cn][2]) - (2.5 * speed[c] / cd.swits[cn][2])) * (cd.bounce[cn] - 0.3));
                car[c].xy += (((Math.random() * 5 * speed[c] / cd.swits[cn][2]) - (2.5 * speed[c] / cd.swits[cn][2])) * (cd.bounce[cn] - 0.3));
            }
            if ((wtouch[c]) && (tskd == 1)) {
                car[c].zy += (((Math.random() * 3.34 * speed[c] / cd.swits[cn][2]) - (1.67 * speed[c] / cd.swits[cn][2])) * (cd.bounce[cn] - 0.3));
                car[c].xy += (((Math.random() * 3.34 * speed[c] / cd.swits[cn][2]) - (1.67 * speed[c] / cd.swits[cn][2])) * (cd.bounce[cn] - 0.3));
            }
        }
        if (frgm >= m) {
            if (hitmag[c] >= cd.maxmag[cn]) {
                if (repcar[c].destat == 700) {
                    repcar[c].destat = 430;
                    if (lastcolido[c] != 0) {
                        repcar[c].destedbyzero = lastcolido[c];
                    }
                }
                if (cntdest[c] < 6) {
                    if (embos[c] == 0) {
                        carobj[car[c].typ].alpha = 1;
                        embodir[c] = Math.floor(Math.random() * 3);
                        if (embodir[c] == 3) {
                            embodir[c] = 0;
                        }
                        embomag[c] = (1.2 + (Math.random() * 0.2));
                    }
                    if (embos[c] == 1) {
                        carobj[car[c].typ].alpha = 2;
                    }
                    embos[c]++;
                    if (embos[c] == 2) {
                        embos[c] = 0;
                        cntdest[c]++;
                    }
                } else {
                    if (cntdest[c] == 6) {
                        carobj[car[c].typ].alpha = 1;
                        embodir[c] = 0;
                        chipburn(c);
                        embos[c] = 0;
                        cntdest[c] = 7;
                    }
                    firexp(c, avnx, ((scy[c][0] + scy[c][1] + scy[c][2] + scy[c][3]) / 4), avnz);
                    if (cntdest[c] < 24) {
                        embos[c]++;
                        if (embos[c] == 5) {
                            burn(c);
                            embos[c] = 0;
                            cntdest[c]++;
                        }
                    }
                }
                if (cntdest[c] == 4) {
                    dest[c] = true;
                }
            }
        }
        var pnt = 0,
        pyclos = 0;
        var ic = 0;
        if (nofocus[c]) {
            cov = 1;
        } else {
            cov = 7;
        }
        for (var i = 0; i < cp.n; i++) {
            if (cp.typ[i] > 0) {
                ic++;
                if (cp.typ[i] == 1) {
                    if (clear[c] == (ic + (nlaps[c] * cp.nsp))) {
                        cov = 1;
                    }
                    if ((Math.abs(car[c].z - cp.z[i]) < (6 + (Math.abs(scz[c][0] + scz[c][1] + scz[c][2] + scz[c][3]) / 4))) && (Math.abs(car[c].x - cp.x[i]) < 70) && (Math.abs(car[c].y - cp.y[i] - 15) < 45)) {
                        if (clear[c] == (ic + (nlaps[c] * cp.nsp) - 1)) {
                            clear[c] = (ic + (nlaps[c] * cp.nsp));
                            pcleared[c] = i;
                            focus[c] = -1;
                        }
                    }
                }
                if (cp.typ[i] == 2) {
                    if (clear[c] == (ic + (nlaps[c] * cp.nsp))) {
                        cov = 1;
                    }
                    if ((Math.abs(car[c].x - cp.x[i]) < (6 + (Math.abs(scx[c][0] + scx[c][1] + scx[c][2] + scx[c][3]) / 4))) && (Math.abs(car[c].z - cp.z[i]) < 70) && (Math.abs(car[c].y - cp.y[i] - 15) < 45)) {
                        if (clear[c] == (ic + (nlaps[c] * cp.nsp) - 1)) {
                            clear[c] = (ic + (nlaps[c] * cp.nsp));
                            pcleared[c] = i;
                            focus[c] = -1;
                        }
                    }
                }
            }
            if (((pyo((car[c].x / 10), (cp.x[i] / 10), (car[c].z / 10), (cp.z[i] / 10)) * cov) < pyclos) || (pyclos == 0)) {
                pnt = i;
                pyclos = (pyo((car[c].x / 10), (cp.x[i] / 10), (car[c].z / 10), (cp.z[i] / 10)) * cov);
            }
        }
        if (clear[c] == (ic + (nlaps[c] * cp.nsp))) {
            nlaps[c]++;
        }
        if (c == im) {
            oncheckpoint = clear[c];
            while (oncheckpoint >= cp.nsp) {
                oncheckpoint -= cp.nsp;
            }
            if (clear[c] == ((cp.nlaps * cp.nsp) - 1)) {
                onlastcheck = true;
            }
            if (cp.haltall) {
                onlastcheck = false;
            }
        }
        if (focus[c] == -1) {
            if (c == 0) {
                pnt += 2;
            } else {
                pnt++;
            }
            if (!nofocus[c]) {
                if ((cp.stage == 5) && (pcleared[c] == 27 || pcleared[c] == 35) && (pnt < 29)) {
                    pnt = 33;
                }
                ic = (pcleared[c] + 1);
                if (ic >= cp.n) {
                    ic = 0;
                }
                while (cp.typ[ic] <= 0) {
                    ic++;
                    if (ic >= cp.n) {
                        ic = 0;
                    }
                }
                if (pnt > ic) {
                    if ((clear[c] != (nlaps[c] * cp.nsp)) || (pnt < pcleared[c])) {
                        if ((cp.stage != 9) || (ic != 9) || (pnt < 16)) {
                            pnt = ic;
                            focus[c] = pnt;
                        } else {
                            pnt = 0;
                        }
                    }
                }
            }
            if (pnt >= cp.n) {
                pnt -= cp.n;
            }
            if (cp.typ[pnt] == -3) {
                pnt = 0;
            }
            if (c == 0) {
                if (missedcp[c] != -1) {
                    missedcp[c] = -1;
                }
            } else {
                if (missedcp[c] != 0) {
                    missedcp[c] = 0;
                }
            }
        } else {
            pnt = focus[c];
            if (c == 0) {
                if ((missedcp[c] == 0) && (mtouch[c]) && (Math.sqrt(pyo((car[c].x / 10), (cp.x[focus[c]] / 10), (car[c].z / 10), (cp.z[focus[c]] / 10))) > 80)) {
                    missedcp[c] = 1;
                }
                if ((missedcp[c] == -2) && (Math.sqrt(pyo((car[c].x / 10), (cp.x[focus[c]] / 10), (car[c].z / 10), (cp.z[focus[c]] / 10))) < 40)) {
                    missedcp[c] = 0;
                }
                if ((missedcp[c] != 0) && (mtouch[c]) && Math.sqrt(pyo((car[c].x / 10), (cp.x[focus[c]] / 10), (car[c].z / 10), (cp.z[focus[c]] / 10))) < 25) {
                    missedcp[c] = 68;
                }
            } else {
                missedcp[c] = 1;
            }
            if (nofocus[c]) {
                focus[c] = -1;
                missedcp[c] = 0;
            }
        }
        if (nofocus[c]) {
            nofocus[c] = false;
        }
        point[c] = pnt;
        if (!car[c].fcnt) {
            for (var i = 0; i < nf; i++) {
                if (Math.abs(obo[fi[i]].mat[10]) > Math.abs(obo[fi[i]].mat[8])) {
                    if ((Math.abs(car[c].z - obo[fi[i]].z) < 20) && (py(car[c].x, obo[fi[i]].x, car[c].y, obo[fi[i]].y) < 55)) {
                        car[c].fcnt = 20;
                        repcar[c].fixat[repcar[c].nfix] = 430;
                        repcar[c].nfix++;
                        if (c == 0) {
                            playsnd(29, 1);
                        }
                    }
                } else {
                    if ((Math.abs(car[c].x - obo[fi[i]].x) < 20) && (py(car[c].z, obo[fi[i]].z, car[c].y, obo[fi[i]].y) < 55)) {
                        car[c].fcnt = 20;
                        repcar[c].fixat[repcar[c].nfix] = 430;
                        repcar[c].nfix++;
                        if (c == 0) {
                            playsnd(29, 1);
                        }
                    }
                }
            }
        } else {
            onelec = true;
            carobj[car[c].typ].alpha = 1;
            if (car[c].fcnt % 2 == 0) {
                if (Math.random() > 0.333) {
                    if (Math.random() > Math.random()) {
                        carobj[car[c].typ].alpha = 3;
                    } else {
                        carobj[car[c].typ].alpha = 2;
                    }
                }
            }
            if (frgm >= m) {
                if (car[c].fcnt == 20) {
                    squash[c] = 0;
                    nbsq[c] = 0;
                    hitmag[c] = 0;
                    cntdest[c] = 0;
                    dest[c] = false;
                    if (c == 0) {
                        cntwis = 0;
                    }
                }
                if (car[c].fcnt == 5) {
                    fixcar(c);
                }
                car[c].fcnt--;
            }
        }
        if (!mtouch[c]) {
            if (trcnt[c] != 1) {
                trcnt[c] = 1;
                lxz[c] = car[c].xz;
            }
            if (loop[c] == 2 || loop[c] == -1) {
                travxy[c] += ((rcomp[c] - lcomp[c]) * m);
                if (Math.abs(travxy[c]) > 135) {
                    rtab[c] = true;
                }
                travzy[c] += ((ucomp[c] - dcomp[c]) * m);
                if (travzy[c] > 135) {
                    ftab[c] = true;
                }
                if (travzy[c] < -135) {
                    btab[c] = true;
                }
            }
            if (lxz[c] != car[c].xz) {
                travxz[c] += (lxz[c] - car[c].xz);
                lxz[c] = car[c].xz;
            }
            if (frgm >= m) {
                if (srfcnt[c] < 10) {
                    if (uwall[c]) {
                        surfer[c] = true;
                    }
                    srfcnt[c]++;
                }
            }
        } else {
            if (!dest[c]) {
                if (!capsized[c]) {
                    if (capcnt[c] != 0) {
                        capcnt[c] = 0;
                    }
                    if ((gtouch[c]) && (frgm >= m)) {
                        if (trcnt[c] != 0) {
                            if (trcnt[c] == 9) {
                                powerup[c] = 0;
                                if (Math.abs(travxy[c]) > 90) {
                                    powerup[c] += (Math.abs(travxy[c]) / 24);
                                } else {
                                    if (rtab[c]) {
                                        powerup[c] += 30;
                                    }
                                }
                                if (Math.abs(travzy[c]) > 90) {
                                    powerup[c] += (Math.abs(travzy[c]) / 18);
                                } else {
                                    if (ftab[c]) {
                                        powerup[c] += 40;
                                    }
                                    if (btab[c]) {
                                        powerup[c] += 40;
                                    }
                                }
                                if (Math.abs(travxz[c]) > 90) {
                                    powerup[c] += (Math.abs(travxz[c]) / 18);
                                }
                                if (surfer[c]) {
                                    powerup[c] += 30;
                                }
                                power[c] += powerup[c];
                                if ((c == im) && (powerup[c] > hpowerup) && (htyp <= 1) && (powerup[c] > 60 || cp.stage == 1 || cp.stage == 2)) {
                                    rpdcatch = 43;
                                    hpowerup = powerup[c];
                                }
                                if (power[c] > 98) {
                                    power[c] = 98;
                                    if (powerup[c] > 150) {
                                        xtpower[c] = 200;
                                    } else {
                                        xtpower[c] = 100;
                                    }
                                }
                            }
                            if (trcnt[c] == 10) {
                                travxy[c] = 0;
                                travzy[c] = 0;
                                travxz[c] = 0;
                                ftab[c] = false;
                                rtab[c] = false;
                                btab[c] = false;
                                trcnt[c] = 0;
                                srfcnt[c] = 0;
                                surfer[c] = false;
                            } else {
                                trcnt[c]++;
                            }
                        }
                    }
                } else {
                    if (trcnt[c] != 0) {
                        travxy[c] = 0;
                        travzy[c] = 0;
                        travxz[c] = 0;
                        ftab[c] = false;
                        rtab[c] = false;
                        btab[c] = false;
                        trcnt[c] = 0;
                        srfcnt[c] = 0;
                        surfer[c] = false;
                    }
                    var flmat = 7,
                    capto = 30;
                    if (c == 0) {
                        if ((cp.stage == 1) && (unlocked == 1)) {
                            flmat = 30;
                            capto = 10;
                        }
                        if ((cp.stage == 2) && (unlocked == 2)) {
                            flmat = 30;
                            capto = 10;
                        }
                        if ((cp.stage == 3) && (unlocked == 3)) {
                            flmat = 25;
                            capto = 15;
                        }
                        if ((cp.stage == 4) && (unlocked == 4)) {
                            flmat = 20;
                            capto = 20;
                        }
                        if ((cp.stage == 5) && (unlocked == 5)) {
                            flmat = 14;
                            capto = 25;
                        }
                    }
                    if (capcnt[c] == 0) {
                        var out = 0;
                        for (var i = 0; i < 4; i++) {
                            if ((Math.abs(scz[c][i]) < flmat) && (Math.abs(scx[c][i]) < flmat)) {
                                out++;
                            }
                        }
                        if (out == 4) {
                            capcnt[c] = 1;
                        }
                    } else {
                        if (frgm >= m) {
                            capcnt[c]++;
                            if (capcnt[c] == capto) {
                                speed[c] = 0;
                                car[c].y += cd.flipy[cn];
                                pxy[c] += 180;
                                car[c].xy += 180;
                                capcnt[c] = 0;
                            }
                        }
                    }
                }
                if ((trcnt[c] == 0) && (speed[c] != 0)) {
                    var pfact = 1;
                    if (c == 0) {
                        if ((cp.stage == 1) && (unlocked == 1)) {
                            pfact = 0.6;
                        }
                        if ((cp.stage == 2) && (unlocked == 2)) {
                            pfact = 0.7;
                        }
                        if ((cp.stage == 3) && (unlocked == 3)) {
                            pfact = 0.8;
                        }
                        if ((cp.stage == 4) && (unlocked == 4)) {
                            pfact = 0.9;
                        }
                    }
                    if (xtpower[c] == 0) {
                        if (power[c] > 0) {
                            power[c] -= (power[c] * power[c] * power[c] * pfact / cd.powerloss[cn]);
                        } else {
                            power[c] = 0;
                        }
                    } else {
                        xtpower[c]--;
                    }
                }
            }
        }
        if (uwall[c]) {
            uwall[c] = false;
        }
        if ((frgm >= m) && (c != 0) && (lastcolido[c] != 0) && (!dest[c])) {
            lastcolido[c]--;
        }
        if (dest[c]) {
            if (cp.dested[c] == 0) {
                if (lastcolido[c] == 0) {
                    cp.dested[c] = 1;
                } else {
                    cp.dested[c] = 2;
                }
            }
        } else {
            if ((cp.dested[c] != 0) && (cp.dested[c] != 3)) {
                cp.dested[c] = 0;
            }
        }
        if ((c == im) && (rpdcatch != 0) && (htyp <= 1)) {
            rpdcatch--;
            if (rpdcatch == 0) {
                catchnow(1);
                if (htyp == 1) {
                    hat = (265 + (Math.random() * 30));
                }
            }
        }
        var xmt = [1, 0, 0];
        var ymt = [0, 1, 0];
        var zmt = [0, 0, 1];
        rotomat(xmt, ymt, car[c].xy);
        rotomat(ymt, zmt, car[c].zy);
        rotomat(xmt, zmt, car[c].xz);
        car[c].mat[0] = xmt[0];
        car[c].mat[1] = ymt[0];
        car[c].mat[2] = zmt[0];
        car[c].mat[4] = xmt[1];
        car[c].mat[5] = ymt[1];
        car[c].mat[6] = zmt[1];
        car[c].mat[8] = xmt[2];
        car[c].mat[9] = ymt[2];
        car[c].mat[10] = zmt[2];
        if (embodir[c]) {
            car[c].mat[(embodir[c] * 4)] *= embomag[c];
            car[c].mat[((embodir[c] * 4) + 1)] *= embomag[c];
            car[c].mat[((embodir[c] * 4) + 2)] *= embomag[c];
        }
    }
}
function colide(c, xc) {
    var kx = [],
    ky = [],
    kz = [];
    var xkx = [],
    xky = [],
    xkz = [];
    for (var i = 0; i < 4; i++) {
        kx[i] = (car[c].x + car[c].keyx[i]);
        if (capsized[c]) {
            ky[i] = (car[c].y + cd.flipy[car[c].typ] + squash[c]);
        } else {
            ky[i] = (car[c].y + car[c].grat);
        }
        kz[i] = (car[c].z + car[c].keyz[i]);
        xkx[i] = (car[xc].x + car[xc].keyx[i]);
        if (capsized[xc]) {
            xky[i] = (car[xc].y + cd.flipy[car[xc].typ] + squash[xc]);
        } else {
            xky[i] = (car[xc].y + car[xc].grat);
        }
        xkz[i] = (car[xc].z + car[xc].keyz[i]);
    }
    rotate(kx, ky, car[c].x, car[c].y, car[c].xy, 4);
    rotate(ky, kz, car[c].y, car[c].z, car[c].zy, 4);
    rotate(kx, kz, car[c].x, car[c].z, car[c].xz, 4);
    rotate(xkx, xky, car[xc].x, car[xc].y, car[xc].xy, 4);
    rotate(xky, xkz, car[xc].y, car[xc].z, car[xc].zy, 4);
    rotate(xkx, xkz, car[xc].x, car[xc].z, car[xc].xz, 4);
    if (rpy(car[c].x, car[xc].x, car[c].y, car[xc].y, car[c].z, car[xc].z) < (((carobj[car[c].typ].colrad * carobj[car[c].typ].colrad) + (carobj[car[xc].typ].colrad * carobj[car[xc].typ].colrad)) * 1.5)) {
        if ((!caught[c][xc]) && (speed[c] != 0 || speed[xc] != 0)) {
            if (Math.abs(power[c] * speed[c] * cd.moment[car[c].typ]) != Math.abs(power[xc] * speed[xc] * cd.moment[car[xc].typ])) {
                if (Math.abs(power[c] * speed[c] * cd.moment[car[c].typ]) > Math.abs(power[xc] * speed[xc] * cd.moment[car[xc].typ])) {
                    dominate[c][xc] = true;
                } else {
                    dominate[c][xc] = false;
                }
            } else {
                if (cd.moment[car[c].typ] > cd.moment[car[xc].typ]) {
                    dominate[c][xc] = true;
                } else {
                    dominate[c][xc] = false;
                }
            }
            caught[c][xc] = true;
        }
    } else {
        if (caught[c][xc]) {
            caught[c][xc] = false;
            dominate[c][xc] = false;
        }
    }
    if (dominate[c][xc]) {
        var crad = ((((scz[c][0] - scz[xc][0] + scz[c][1] - scz[xc][1] + scz[c][2] - scz[xc][2] + scz[c][3] - scz[xc][3]) * (scz[c][0] - scz[xc][0] + scz[c][1] - scz[xc][1] + scz[c][2] - scz[xc][2] + scz[c][3] - scz[xc][3])) + ((scx[c][0] - scx[xc][0] + scx[c][1] - scx[xc][1] + scx[c][2] - scx[xc][2] + scx[c][3] - scx[xc][3]) * (scx[c][0] - scx[xc][0] + scx[c][1] - scx[xc][1] + scx[c][2] - scx[xc][2] + scx[c][3] - scx[xc][3]))) / 16);
        var arad = 70;
        for (var i = 0; i < 4; i++) {
            var gotcol = false;
            for (var j = 0; j < 4; j++) {
                if ((rpy(kx[i], xkx[j], ky[i], xky[j], kz[i], xkz[j]) < ((crad + arad) * (cd.comprad[car[xc].typ] + cd.comprad[car[c].typ])))) {
                    if (Math.abs(scx[c][i] * cd.moment[car[c].typ]) > Math.abs(scx[xc][j] * cd.moment[car[xc].typ])) {
                        var tm = (scx[xc][j] * cd.revpush[car[c].typ]);
                        if (tm > 30) {
                            tm = 30;
                        }
                        if (tm < -30) {
                            tm = -30;
                        }
                        var vctm = (scx[c][i] * cd.push[car[c].typ]);
                        if (vctm > 30) {
                            vctm = 30;
                        }
                        if (vctm < -30) {
                            vctm = -30;
                        }
                        scx[xc][j] += vctm;
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(0, j, vctm * cd.moment[car[c].typ], xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        scx[c][i] -= tm;
                        regn(0, i, -tm * cd.moment[car[c].typ], c);
                        scy[c][i] += cd.revlift[car[c].typ];
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(2, j, (cd.revlift[car[c].typ] * 7), xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        if (Math.random() > Math.random()) {
                            sprks(car[c].typ, ((kx[i] + xkx[j]) / 2), ((ky[i] + xky[j]) / 2), ((kz[i] + xkz[j]) / 2), ((scx[xc][j] + scx[c][i]) / 4), ((scy[xc][j] + scy[c][i]) / 4), ((scz[xc][j] + scz[c][i]) / 4), 2);
                        }
                    }
                    if (Math.abs(scz[c][i] * cd.moment[car[c].typ]) > Math.abs(scz[xc][j] * cd.moment[car[xc].typ])) {
                        var tm = (scz[xc][j] * cd.revpush[car[c].typ]);
                        if (tm > 30) {
                            tm = 30;
                        }
                        if (tm < -30) {
                            tm = -30;
                        }
                        var vctm = (scz[c][i] * cd.push[car[c].typ]);
                        if (vctm > 30) {
                            vctm = 30;
                        }
                        if (vctm < -30) {
                            vctm = -30;
                        }
                        scz[xc][j] += vctm;
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(1, j, vctm * cd.moment[car[c].typ], xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        scz[c][i] -= tm;
                        regn(1, i, -tm * cd.moment[car[c].typ], c);
                        scy[c][i] += cd.revlift[car[c].typ];
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(2, j, (cd.revlift[car[c].typ] * 7), xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        if (Math.random() > Math.random()) {
                            sprks(car[c].typ, ((kx[i] + xkx[j]) / 2), ((ky[i] + xky[j]) / 2), ((kz[i] + xkz[j]) / 2), ((scx[xc][j] + scx[c][i]) / 4), ((scy[xc][j] + scy[c][i]) / 4), ((scz[xc][j] + scz[c][i]) / 4), 2);
                        }
                    }
                    if (c == 0) {
                        lastcolido[xc] = 70;
                    }
                    if (xc == 0) {
                        lastcolido[c] = 70;
                    }
                    scy[xc][j] += cd.lift[car[c].typ];
                    gotcol = true;
                }
            }
            if ((!gotcol) && (mtouch[c]) && (mtouch[xc])) {
                var intrsct = false;
                var aro = Math.abs(((xkx[1] - xkx[0]) * (xkz[2] - xkz[0])) - ((xkx[2] - xkx[0]) * (xkz[1] - xkz[0])));
                var ar1 = Math.abs(((xkx[0] - kx[i]) * (xkz[1] - kz[i])) - ((xkx[1] - kx[i]) * (xkz[0] - kz[i])));
                var ar2 = Math.abs(((xkx[1] - kx[i]) * (xkz[2] - kz[i])) - ((xkx[2] - kx[i]) * (xkz[1] - kz[i])));
                var ar3 = Math.abs(((xkx[2] - kx[i]) * (xkz[0] - kz[i])) - ((xkx[0] - kx[i]) * (xkz[2] - kz[i])));
                if ((ar1 + ar2 + ar3) < (aro + 10)) {
                    intrsct = true;
                }
                if (!intrsct) {
                    aro = Math.abs(((xkx[1] - xkx[3]) * (xkz[2] - xkz[3])) - ((xkx[2] - xkx[3]) * (xkz[1] - xkz[3])));
                    ar1 = Math.abs(((xkx[3] - kx[i]) * (xkz[1] - kz[i])) - ((xkx[1] - kx[i]) * (xkz[3] - kz[i])));
                    ar2 = Math.abs(((xkx[1] - kx[i]) * (xkz[2] - kz[i])) - ((xkx[2] - kx[i]) * (xkz[1] - kz[i])));
                    ar3 = Math.abs(((xkx[2] - kx[i]) * (xkz[3] - kz[i])) - ((xkx[3] - kx[i]) * (xkz[2] - kz[i])));
                    if ((ar1 + ar2 + ar3) < (aro + 10)) {
                        intrsct = true;
                    }
                }
                if (intrsct) {
                    var j = 0;
                    var closj = rpy(kx[i], xkx[0], ky[i], xky[0], kz[i], xkz[0]);
                    for (var k = 1; k < 4; k++) {
                        pyclos = rpy(kx[i], xkx[k], ky[i], xky[k], kz[i], xkz[k]);
                        if (pyclos < closj) {
                            closj = pyclos;
                            j = k;
                        }
                    }
                    if (Math.abs(scx[c][i] * cd.moment[car[c].typ]) > Math.abs(scx[xc][j] * cd.moment[car[xc].typ])) {
                        var tm = (scx[xc][j] * cd.revpush[car[c].typ]);
                        if (tm > 30) {
                            tm = 30;
                        }
                        if (tm < -30) {
                            tm = -30;
                        }
                        var vctm = (scx[c][i] * cd.push[car[c].typ]);
                        if (vctm > 30) {
                            vctm = 30;
                        }
                        if (vctm < -30) {
                            vctm = -30;
                        }
                        scx[xc][j] += vctm;
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(0, j, vctm * cd.moment[car[c].typ], xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        scx[c][i] -= tm;
                        regn(0, i, -tm * cd.moment[car[c].typ], c);
                        scy[c][i] += cd.revlift[car[c].typ];
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(2, j, (cd.revlift[car[c].typ] * 7), xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        if (Math.random() > Math.random()) {
                            sprks(car[c].typ, ((kx[i] + xkx[j]) / 2), ((ky[i] + xky[j]) / 2), ((kz[i] + xkz[j]) / 2), ((scx[xc][j] + scx[c][i]) / 4), ((scy[xc][j] + scy[c][i]) / 4), ((scz[xc][j] + scz[c][i]) / 4), 2);
                        }
                    }
                    if (Math.abs(scz[c][i] * cd.moment[car[c].typ]) > Math.abs(scz[xc][j] * cd.moment[car[xc].typ])) {
                        var tm = (scz[xc][j] * cd.revpush[car[c].typ]);
                        if (tm > 30) {
                            tm = 30;
                        }
                        if (tm < -30) {
                            tm = -30;
                        }
                        var vctm = (scz[c][i] * cd.push[car[c].typ]);
                        if (vctm > 30) {
                            vctm = 30;
                        }
                        if (vctm < -30) {
                            vctm = -30;
                        }
                        scz[xc][j] += vctm;
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(1, j, vctm * cd.moment[car[c].typ], xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        scz[c][i] -= tm;
                        regn(1, i, -tm * cd.moment[car[c].typ], c);
                        scy[c][i] += cd.revlift[car[c].typ];
                        if (c == 0) {
                            colidim[xc] = true;
                        }
                        regn(2, j, (cd.revlift[car[c].typ] * 7), xc);
                        if (colidim[xc]) {
                            colidim[xc] = false;
                        }
                        if (Math.random() > Math.random()) {
                            sprks(car[c].typ, ((kx[i] + xkx[j]) / 2), ((ky[i] + xky[j]) / 2), ((kz[i] + xkz[j]) / 2), ((scx[xc][j] + scx[c][i]) / 4), ((scy[xc][j] + scy[c][i]) / 4), ((scz[xc][j] + scz[c][i]) / 4), 2);
                        }
                    }
                    if (c == 0) {
                        lastcolido[xc] = 70;
                    }
                    if (xc == 0) {
                        lastcolido[c] = 70;
                    }
                    scy[xc][j] += cd.lift[car[c].typ];
                }
            }
        }
    }
}
var colidim = [false, false, false, false, false, false, false];
function regn(nr, k, mag, c) {
    if (fase == 7) {
        mag *= cd.dammult[car[c].typ];
    }
    if (Math.abs(mag) > 10) {
        if (fase == 7) {
            repcar[c].regat[repcar[c].nreg] = 430;
            repcar[c].regnr[repcar[c].nreg] = nr;
            repcar[c].regk[repcar[c].nreg] = k;
            repcar[c].regmag[repcar[c].nreg] = mag;
            repcar[c].regmtch[repcar[c].nreg] = mtouch[c];
            repcar[c].nreg++;
        }
        if (mag > 10) {
            mag -= 10;
        }
        if (mag < -10) {
            mag += 10;
        }
        var zsing = 0,
        xsing = 0;
        var nr2stop = false;
        if (nr == 2) {
            nr2stop = true;
            var rzy = car[c].zy,
            rxy = car[c].xy;
            while (rzy < 360) {
                rzy += 360;
            }
            while (rzy > 360) {
                rzy -= 360;
            }
            if ((rzy < 210) && (rzy > 150)) {
                zsing = -1;
            }
            if ((rzy > 330) || (rzy < 30)) {
                zsing = 1;
            }
            while (rxy < 360) {
                rxy += 360;
            }
            while (rxy > 360) {
                rxy -= 360;
            }
            if ((rxy < 210) && (rxy > 150)) {
                xsing = -1;
            }
            if ((rxy > 330) || (rxy < 30)) {
                xsing = 1;
            }
            if ((xsing * zsing) == 0 || mtouch[c]) {
                nr2stop = false;
            }
            if ((xsing * zsing) == -1) {
                if (nbsq[c] > 0) {
                    nr2stop = false;
                    nr = 3;
                    nbsq[c] = 0;
                } else {
                    nbsq[c]++;
                }
            }
            if ((fase == 7) && (c == 0 || colidim[c])) {
                crashsnd(mag, (xsing * zsing));
            }
        } else {
            if ((fase == 7) && (c == 0 || colidim[c])) {
                crashsnd(mag, 0);
            }
        }
        var rad = carobj[car[c].typ];
        if (!nr2stop) {
            if (rad.iscar == 1) {
                rad.dvert = [];
                for (var i = 0; i < rad.ni; i++) {
                    rad.dvert[(i * 3)] = -rad.vrt[(rad.tri[(i * 3)] * 3)];
                    rad.dvert[((i * 3) + 1)] = rad.vrt[((rad.tri[(i * 3)] * 3) + 1)];
                    rad.dvert[((i * 3) + 2)] = rad.vrt[((rad.tri[(i * 3)] * 3) + 2)];
                }
                rad.iscar = 2;
            }
            var pixelread = false;
            var framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rad.texture[1], 0);
            var pixels = null;
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                pixels = new Uint8Array((256 * 256 * 4));
                gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                pixelread = true;
            }
            var tsq = 0,
            nsq = 0;
            for (var i = 0; i < rad.ni; i++) {
                var tmag = 0;
                var modpix = 0;
                if ((nr < 3) && (pyo(car[c].keyx[k], rad.dvert[(i * 3)], car[c].keyz[k], rad.dvert[((i * 3) + 2)]) < cd.clrad[car[c].typ])) {
                    tmag = ((mag / 30) * Math.random());
                    if (nr == 0) {
                        rad.dvert[((i * 3) + 2)] -= (tmag * msin(car[c].xz) * mcos(car[c].zy));
                        rad.dvert[(i * 3)] += (tmag * mcos(car[c].xz) * mcos(car[c].xy));
                    }
                    if (nr == 1) {
                        rad.dvert[((i * 3) + 2)] += (tmag * mcos(car[c].xz) * mcos(car[c].zy));
                        rad.dvert[(i * 3)] += (tmag * msin(car[c].xz) * mcos(car[c].xy));
                    }
                    if (nr == 2) {
                        rad.dvert[((i * 3) + 2)] -= (tmag * msin(car[c].zy));
                        rad.dvert[(i * 3)] += (tmag * msin(car[c].xy));
                    }
                    if (Math.abs(tmag) > 0.1) {
                        if (Math.random() > 0.91) {
                            if (fase != 9) {
                                chipaway(c, rad.dvert[(i * 3)], rad.dvert[((i * 3) + 1)], rad.dvert[((i * 3) + 2)], tmag);
                            }
                        }
                    }
                    if (fase == 7) {
                        hitmag[c] += (Math.abs(tmag) * 0.667);
                    }
                    modpix = 1;
                }
                if ((nr == 3) && (Math.abs(rad.dvert[((i * 3) + 1)] - cd.flipy[car[c].typ] - squash[c]) < (cd.msquash[c][car[c].typ] * 3) || rad.dvert[((i * 3) + 1)] > cd.flipy[car[c].typ] + squash[c]) && (Math.abs(squash[c]) < cd.msquash[car[c].typ])) {
                    tmag = ((mag / 15) * Math.random());
                    rad.dvert[((i * 3) + 1)] -= tmag;
                    tsq -= tmag;
                    nsq++;
                    if (Math.abs(tmag) > 0.1) {
                        if (Math.random() > 0.91) {
                            if (fase != 9) {
                                chipaway(c, rad.dvert[(i * 3)], rad.dvert[((i * 3) + 1)], rad.dvert[((i * 3) + 2)], tmag);
                            }
                        }
                    }
                    if (fase == 7) {
                        hitmag[c] += (Math.abs(tmag) * 0.667);
                    }
                    modpix = 2;
                }
                if ((pixelread) && (modpix)) {
                    var pxc = Math.round(rad.tex[(rad.tri[((i * 3) + 2)] * 2)] * 256);
                    var pyc = Math.round((1 - rad.tex[((rad.tri[((i * 3) + 2)] * 2) + 1)]) * 256);
                    var cmag = (Math.abs(tmag) * 11 * cd.dammult[car[c].typ] * cd.colrdammult[car[c].typ]);
                    var npt = Math.round(cmag + (Math.random() * cmag));
                    for (var p = 0; p < npt; p++) {
                        var pxv = Math.round((6 * Math.random()) - 3);
                        var pyv = Math.round((6 * Math.random()) - 3);
                        if ((pxv == 0) && (pyv == 0)) {
                            var ein = 1;
                            if (Math.random() > Math.random()) {
                                ein = -1;
                            }
                            if (Math.random() > Math.random()) {
                                pxv += ein;
                            } else {
                                pyv += ein;
                            }
                        }
                        var px = (pxc + pxv);
                        var py = (pyc + pyv);
                        var rnp = Math.round(20 + (Math.random() * 100));
                        var glass = false;
                        var ongrey = false;
                        if (modpix == 2) {
                            glass = true;
                        }
                        while ((rnp > 0) || (glass)) {
                            var pp = ((px * 4) + (py * 256 * 4));
                            if ((pixels[pp] == pixels[pp + 1]) && (pixels[pp + 1] == pixels[pp + 2])) {
                                pixels[pp] += Math.round((Math.random() * 10) - 5);
                                if (pixels[pp] < 0) {
                                    pixels[pp] = 0;
                                }
                                if (pixels[pp] > 192) {
                                    pixels[pp] = 192;
                                }
                                pixels[pp + 1] = pixels[pp];
                                pixels[pp + 2] = pixels[pp];
                                if (!ongrey) {
                                    ongrey = true;
                                }
                                if (glass) {
                                    glass = false;
                                    rnp = 0;
                                }
                            } else {
                                if ((pixels[pp] == skyglass[0]) && (pixels[pp + 1] == skyglass[1]) && (pixels[pp + 2] == skyglass[2])) {
                                    if (!glass) {
                                        if (Math.random() > 0.95) {
                                            glass = true;
                                        }
                                        rnp = 0;
                                    }
                                    if (modpix == 2) {
                                        if (Math.random() < 0.5) {
                                            glass = false;
                                        }
                                        rnp = 0;
                                        modpix = 3;
                                    }
                                    if (glass) {
                                        pixels[pp + 3] -= 150;
                                        if (pixels[pp + 3] < 0) {
                                            pixels[pp + 3] = 0;
                                        }
                                    }
                                } else {
                                    if ((!glass) && (!ongrey)) {
                                        var av = (((Math.abs(pxv) + Math.abs(pyv)) / 2) + 1);
                                        if (av < 2) {
                                            av = 2;
                                        }
                                        pixels[pp] = ((65 + (pixels[pp] * av)) / (1 + av));
                                        pixels[pp + 1] = ((57 + (pixels[pp + 1] * av)) / (1 + av));
                                        pixels[pp + 2] = ((55 + (pixels[pp + 2] * av)) / (1 + av));
                                        car[c].ctxl[0] = (px / 256);
                                        car[c].ctxl[1] = (py / 256);
                                        if (Math.random() > 0.8) {
                                            if (Math.abs(pxv) < Math.abs(pyv)) {
                                                pxv += Math.round((Math.random() * 2) - 1);
                                            } else {
                                                pyv += Math.round((Math.random() * 2) - 1);
                                            }
                                        }
                                    } else {
                                        glass = false;
                                        rnp = 0;
                                    }
                                }
                            }
                            px += pxv;
                            py += pyv;
                            rnp--;
                        }
                    }
                }
            }
            if ((nr == 3) && (nsq > 0)) {
                squash[c] += (tsq / nsq);
            }
            if (pixelread) {
                gl.bindTexture(gl.TEXTURE_2D, rad.texture[1]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.deleteFramebuffer(framebuffer);
            rad.loaded = 0;
            gl.deleteBuffer(rad.vbuf);
            rad.vbuf = null;
            rad.vbuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, rad.vbuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rad.dvert), gl.STATIC_DRAW);
            rad.loaded = 2;
        }
    }
}
function burn(c) {
    var rad = carobj[car[c].typ];
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rad.texture[1], 0);
    var pixels = null;
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        pixels = new Uint8Array((256 * 256 * 4));
        gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        for (var p = bshft[c]; p < (256 * 256 * 4); p += 12) {
            pixels[p] = (14 + (pixels[p] * 0.6667));
            pixels[p + 1] = (4 + (pixels[p + 1] * 0.6667));
            pixels[p + 2] = (pixels[p + 2] * 0.6667);
        }
        gl.bindTexture(gl.TEXTURE_2D, rad.texture[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.deleteFramebuffer(framebuffer);
    bshft[c] += 4;
    if (bshft[c] == 12) {
        bshft[c] = 0;
    }
}
function chipburn(c) {
    var rad = carobj[car[c].typ];
    for (var i = 0; i < rad.ni; i++) {
        if ((Math.random() > Math.random()) && (Math.random() > Math.random())) {
            car[c].ctxl[0] = Math.random();
            car[c].ctxl[1] = Math.random();
            chipaway(c, rad.dvert[(i * 3)], rad.dvert[((i * 3) + 1)], rad.dvert[((i * 3) + 2)], (0.1 + (Math.random() * 0.2)));
        }
    }
}
function fixcar(c) {
    var rad = carobj[car[c].typ];
    rad.alpha = 1;
    rad.dvert = [];
    for (var i = 0; i < rad.ni; i++) {
        rad.dvert[(i * 3)] = -rad.vrt[(rad.tri[(i * 3)] * 3)];
        rad.dvert[((i * 3) + 1)] = rad.vrt[((rad.tri[(i * 3)] * 3) + 1)];
        rad.dvert[((i * 3) + 2)] = rad.vrt[((rad.tri[(i * 3)] * 3) + 2)];
    }
    rad.iscar = 2;
    rad.loaded = 0;
    gl.deleteBuffer(rad.vbuf);
    rad.vbuf = null;
    rad.vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rad.vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rad.dvert), gl.STATIC_DRAW);
    gl.deleteTexture(rad.texture[1]);
    rad.texture[1] = null;
    rad.texture[1] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rad.texture[1]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cartexture[car[c].typ]);
    gl.generateMipmap(gl.TEXTURE_2D);
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rad.texture[1], 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
        var pixels = new Uint8Array((256 * 256 * 4));
        gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        for (var p = 0; p < (256 * 256 * 4); p += 4) {
            if ((pixels[p] == 116) && (pixels[p + 1] == 130) && (pixels[p + 2] == 140)) {
                pixels[p] = skyglass[0];
                pixels[p + 1] = skyglass[1];
                pixels[p + 2] = skyglass[2];
                pixels[p + 3] = 210;
            }
        }
        gl.bindTexture(gl.TEXTURE_2D, rad.texture[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.deleteFramebuffer(framebuffer);
    rad.loaded = 2;
}
function rotomat(xp, yp, an) {
    if (an != 0) {
        for (var i = 0; i < 3; i++) {
            var xptmp = xp[i];
            xp[i] = ((xp[i] * mcos(an)) - (yp[i] * msin(an)));
            yp[i] = ((xptmp * msin(an)) + (yp[i] * mcos(an)));
        }
    }
}
function rotate(xp, yp, cx, cy, an, n) {
    if (an != 0) {
        for (var i = 0; i < n; i++) {
            var xptmp = xp[i];
            xp[i] = cx + (((xp[i] - cx) * mcos(an)) - ((yp[i] - cy) * msin(an)));
            yp[i] = cy + (((xptmp - cx) * msin(an)) + ((yp[i] - cy) * mcos(an)));
        }
    }
}
function mcos(an) {
    return Math.cos(an * Math.PI / 180);
}
function msin(an) {
    return Math.sin(an * Math.PI / 180);
}
function pyo(x1, x2, z1, z2) {
    return (((x1 - x2) * (x1 - x2)) + ((z1 - z2) * (z1 - z2)));
}
function rpy(x1, x2, y1, y2, z1, z2) {
    return (((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)) + ((z1 - z2) * (z1 - z2)));
}
var mutegame = false;
var mutemusic = false;
var mutedmusic = false;
var omutemusic = false;
var omutegame = false;
var mutestart = false;
var gpat = 4;
var gotgamepad = false;
var gpress = [0, 0, 0, 0, 0, 0, 0, 0];
var gparr = false;
var needrotate = false;
var totime = 0, nfr = 0, actat = 20, ltime = -1;
var m = 0.9; // Affects framerate. By default it's 0.7, but the physics are tied to the framerate, and 0.9 results in 21, thus fixing the physics.
var frgm = 0;
var canw = 1280, canh = 720, tcanh = 720;
var mw = 1, mh = 1;
var avm = 1;
var adm = 0;
var fase = 0;

function updateFramerate() {
    window.performance.before ??= new Date();
    window.performance.after = new Date();
    window.performance.frametime = window.performance.after - window.performance.before;
    window.performance.before = window.performance.after;
    window.performance.framerate = Math.round(window.performance.frametime > 0 ? 1000 / window.performance.frametime : 0);
}

function gameloop() {

    updateFramerate();
    document.querySelector('.overlay > #framerate > .overlay-widget-value').textContent = window.performance.framerate;
    document.querySelector('.overlay > #speed > .overlay-widget-value').textContent = Math.round(speed[0] ?? 0.0);
    
    if (canw != window.innerWidth || tcanh != window.innerHeight) {
        canw = window.innerWidth;
        canh = window.innerHeight;
        tcanh = canh;
        if (canh > canw) {
            canh = canw;
            needrotate = true;
        } else {
            needrotate = false;
        }
        mw = (canw / 1280);
        mh = (canh / 720);
        avm = ((mw + mh) / 2);
        adm = (((canw / canh) - 1.777) * 76);
        canvas3D.width = canw;
        canvas3D.height = canh;
        canvas3D.style.width = "" + canw + "px";
        canvas3D.style.height = "" + canh + "px";
        canvas2D.width = canw;
        canvas2D.height = tcanh;
        canvas2D.style.width = "" + canw + "px";
        canvas2D.style.height = "" + tcanh + "px";
        gl.viewport(0, 0, canw, canh);
        gofullscreen = false;
    }
    if (gotgamepad) {
        var gp = navigator.getGamepads();
        for (var i = 0; i < gp.length; i++) {
            if (gpress[i] == null) {
                gpress[i] = 0;
            }
            if (gp[i] != null) {
                if (gp[i].connected) {
                    var aleft = false,
                    aright = false;
                    if (Math.abs(gp[i].axes[0]) > 0.1) {
                        if (gp[i].axes[0] < 0) {
                            aleft = true;
                        } else {
                            aright = true;
                        }
                    }
                    if (Math.abs(gp[i].axes[2]) > 0.1) {
                        if (gp[i].axes[2] < 0) {
                            aleft = true;
                        } else {
                            aright = true;
                        }
                    }
                    var aup = false,
                    adown = false;
                    if (Math.abs(gp[i].axes[1]) > 0.1) {
                        if (gp[i].axes[1] < 0) {
                            aup = true;
                        } else {
                            adown = true;
                        }
                    }
                    if (Math.abs(gp[i].axes[3]) > 0.1) {
                        if (gp[i].axes[3] < 0) {
                            aup = true;
                        } else {
                            adown = true;
                        }
                    }
                    if (gp[i].buttons[0].pressed || aup) {
                        u[0].up = true;
                        gpress[i] = 10;
                    } else {
                        if (gpress[i]) {
                            u[0].up = false;
                        }
                    }
                    if (gp[i].buttons[2].pressed || adown) {
                        u[0].down = true;
                        gpress[i] = 10;
                    } else {
                        if (gpress[i]) {
                            u[0].down = false;
                        }
                    }
                    if (gp[i].buttons[3].pressed || aleft) {
                        u[0].left = true;
                        gpress[i] = 10;
                    } else {
                        if (gpress[i]) {
                            u[0].left = false;
                        }
                    }
                    if (gp[i].buttons[1].pressed || aright) {
                        u[0].right = true;
                        gpress[i] = 10;
                    } else {
                        if (gpress[i]) {
                            u[0].right = false;
                        }
                    }
                    if (gp[i].buttons.length > 7) {
                        if (gp[i].buttons[4].pressed) {
                            if (!gparr) {
                                if (u[0].arrace) {
                                    u[0].arrace = false;
                                } else {
                                    u[0].arrace = true;
                                }
                                gparr = true;
                            }
                            gpress[i] = 10;
                        } else {
                            if (gpress[i]) {
                                gparr = false;
                            }
                        }
                        if (gp[i].buttons[5].pressed) {
                            u[0].handb = true;
                            gpress[i] = 10;
                        } else {
                            if (gpress[i]) {
                                u[0].handb = false;
                            }
                        }
                        if (gp[i].buttons[6].pressed) {
                            lookback = -1;
                            gpress[i] = 10;
                        } else {
                            if (gpress[i]) {
                                if (lookback == -1) {
                                    lookback = 0;
                                }
                            }
                        }
                        if (gp[i].buttons[7].pressed) {
                            lookback = 1;
                            gpress[i] = 10;
                        } else {
                            if (gpress[i]) {
                                if (lookback == 1) {
                                    lookback = 0;
                                }
                            }
                        }
                    }
                    var penter = false;
                    for (var k = 8; k < gp[i].buttons.length; k++) {
                        if (gp[i].buttons[k].pressed) {
                            penter = true;
                        }
                    }
                    if (penter) {
                        if (!enter) {
                            enter = 1;
                        }
                        gpress[i] = 10;
                    } else {
                        if (gpress[i]) {
                            if (enter) {
                                enter = 0;
                            }
                        }
                    }
                    if (gpress[i]) {
                        gpress[i]--;
                    }
                }
            }
        }
    }
    if (fase == 0) {
        loaddata();
    }
    if (fase == 1) {
        drawmain();
    }
    if (fase == 2) {
        carselect();
    }
    if (fase == 3) {
        stageloading();
    }
    if (fase == 4) {
        stageselect();
    }
    if (fase == 5) {
        gameinstructions();
    }
    if (fase == 7 || fase == 8 || fase == 9 || fase == 10) {
        gameworks();
    }
    if (fase == 11) {
        pausedgame();
    }
    if (fase == 12) {
        endgame();
        unlockedcar();
    }
    if (fase == 13) {
        resetgame();
    }
    if (fase == 14) {
        rd.fillStyle = "#15190D";
        rd.fillRect(0, 0, canw, canh);
		//hmm
    }
    if (mutemusic) {
        if (!mutedmusic) {
            pausemusic();
            mutedmusic = true;
        }
    } else {
        if (mutedmusic) {
            resumemusic();
            mutedmusic = false;
        }
    }
    if (needrotate) {
        rd.fillStyle = "#15190D";
        rd.fillRect(0, canh, canw, (tcanh - canh));
        if (isphone) {
            var rwd = 95;
            var rhd = 105;
            if (rwd > (canw * 0.9)) {
                rhd = (rhd * ((canw * 0.9) / rwd));
                rwd = (canw * 0.9);
            }
            rd.drawImage(rosize, ((canw * 0.5) - (rwd * 0.5)), (canh + (rhd * 0.4)), rwd, rhd);
        }
    }
    var date = new Date();
    var ctime = date.getTime();
    if (ltime == -1) {
        totime = 20;
    } else {
        totime += (ctime - ltime);
    }
    ltime = ctime;
    nfr++;
    if (nfr == 5) {
        if (totime > (250 * m)) {
            actat--;
            if (actat < 5) {
                actat = 5;
            }
        } else {
            actat += 2;
        }
        totime = 0;
        nfr = 0;
    }
    if (frgm >= m) {
        frgm -= 1;
    }
    frgm += m;
    setTimeout("gameloop()", actat);
}
var interaud = null;
var interaudstat = 0;
var firstinterplay = true;
function playintertrack() {
    try {
        if (interaudstat == 0) {
            interaud = new Audio("data/music/shift.mp3");
            interaud.volume = 1;
            interaud.loop = true;
        }
        interaud.volume = 0.6;
        if (!mutemusic) {
            if ((!isios) || (!firstinterplay)) {
                interaud.play();
            }
        }
        firstinterplay = false;
    } catch (e) {}
    interaudstat = 1;
}
function pauseintertrack() {
    if (interaudstat == 1) {
        interaud.pause();
        interaudstat = 2;
    }
}
var stageaud = null;
var stageaudstat = 0;
var laststageaud = -1;
function playtrack() {
    try {
        var playedbefore = false;
        if (laststageaud != cp.stage) {
            stageaud = new Audio("data/music/stage" + cp.stage + ".mp3");
            stageaud.volume = 1;
            stageaud.loop = true;
            laststageaud = cp.stage;
        } else {
            stageaud.currentTime = 0;
            playedbefore = true;
        }
        stageaud.volume = 0.7;
        if ((cp.stage == 3) && (mutemusic) && (mutestart)) {
            mutestart = false;
            mutemusic = false;
            mutedmusic = false;
        }
        if (!mutemusic) {
            if ((!isios) || (playedbefore)) {
                stageaud.play();
            }
        }
    } catch (e) {}
    stageaudstat = 1;
}
function stopstagetrack() {
    if (stageaudstat == 1) {
        stageaud.pause();
        stageaudstat = 2;
    }
}
function resumestagetrack() {
    if (stageaudstat == 2) {
        if (!mutemusic) {
            stageaud.play();
        }
        stageaudstat = 1;
    }
}
function pausemusic() {
    if (stageaudstat == 1) {
        stageaud.pause();
    }
    if (interaudstat == 1) {
        interaud.pause();
    }
}
function resumemusic() {
    if (stageaudstat == 1) {
        stageaud.play();
    }
    if (interaudstat == 1) {
        interaud.play();
    }
}
var canplaysnd = false;
var soundau = null;
var sndb = [];
var sndload = [];
var intersndload = 0;
var enginau = null;
var engvol = null;
var engb = [];
var engload = [];
for (var i = 0; i < 19; i++) {
    engload[i] = false;
}
var engsource = null;
try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    soundau = new AudioContext();
    enginau = new AudioContext();
    engvol = enginau.createGain();
    canplaysnd = true;
} catch (e) {
    canplaysnd = false;
}
function loadsnd(num) {
    if (canplaysnd) {
        sndload[num] = false;
        var request = new XMLHttpRequest();
        request.open("GET", "data/sounds/s" + num + ".mp3", true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            soundau.decodeAudioData(request.response, function (buffer) {
                sndb[num] = buffer;
            }, onError);
            sndload[num] = true;
        };
        request.send();
    }
}
function onError() {}
var playedasnd = false;
function playsnd(num, pbr) {
    if ((canplaysnd) && (sndload[num]) && (!mutegame)) {
        var source = soundau.createBufferSource();
        source.buffer = sndb[num];
        source.connect(soundau.destination);
        source.playbackRate.value = pbr;
        source.start();
        playedasnd = true;
    }
}
function loadeng(num) {
    if (canplaysnd) {
        var request = new XMLHttpRequest();
        request.open("GET", "data/sounds/eng" + num + ".wav", true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            enginau.decodeAudioData(request.response, function (buffer) {
                engb[num] = buffer;
            }, onError);
            engload[num] = true;
        };
        request.send();
    }
}
var engstarted = false;
function starteng(engloop) {
    if ((canplaysnd) && (engload[sel[0]]) && (!mutegame) && (!holdcnt)) {
        engsource = enginau.createBufferSource();
        engsource.buffer = engb[sel[0]];
        engsource.connect(engvol);
        engvol.connect(enginau.destination);
        engsource.loop = engloop;
        engsource.start();
        engstarted = true;
    }
}
var gofullscreen = false;
var checkmusic = 0;
var checksnd = 5;
function checknplay() {
    if (!gofullscreen) {
        fullscreen();
        gofullscreen = true;
    }
    if ((interaudstat == 1) && (checkmusic != 2) && (!mutemusic)) {
        if (interaud.currentTime == 0) {
            interaud.play();
        }
        checkmusic = 2;
    }
    if ((stageaudstat == 1) && (checkmusic != 1) && (!mutemusic)) {
        if (stageaud.currentTime == 0) {
            stageaud.play();
        }
        checkmusic = 1;
    }
    if ((checksnd) && (playedasnd) && (fase == 7) && (canplaysnd) && (sndload[25]) && (!mutegame)) {
        if (soundau.currentTime == 0) {
            playsnd(25, 1);
            checksnd = 1;
        }
        checksnd--;
    }
}
var bfgscrape = 0;
function grndscrapesnd(typ, sx, sy, sz) {
    if (bfgscrape == 0) {
        var smag = Math.sqrt((sx * sx) + (sy * sy) + (sz * sz));
        if (smag > 5) {
            var scpr = (0.5 + (((smag - 5) / 20) * 0.5));
            if (scpr > 1) {
                scpr = 1;
            }
            var sdt = 0;
            if (typ == 2) {
                sdt += 2;
            }
            if (Math.random() > Math.random()) {
                playsnd((23 + sdt), scpr);
            } else {
                playsnd((24 + sdt), scpr);
            }
            bfgscrape = 5;
        }
    }
}
var bfscrape = 0;
var lscrape = -1;
function scrapesnd(sx, sy, sz) {
    if (bfscrape == 0) {
        if (Math.sqrt((sx * sx) + (sy * sy) + (sz * sz)) > 5) {
            var srp = Math.floor(Math.random() * 3);
            if (srp == 4) {
                srp = 0;
            }
            while (srp == lscrape) {
                srp = Math.floor(Math.random() * 3);
                if (srp == 4) {
                    srp = 0;
                }
            }
            playsnd((srp + 20), 1);
            bfscrape = 5;
        }
    }
}
var bfbump = [0, 0];
var onbsnd = false;
function bumpsnd(bi, bmag, typ) {
    if ((bfbump[bi] == 0) && (bmag > 10)) {
        var bmpr = (((bmag - 10) / 20) * 0.3);
        if (bmpr > 0.3) {
            bmpr = 0.3;
        }
        if (typ == 2) {
            bmpr += 0.2;
        } else {
            bmpr += 0.4;
        }
        bmpr += (0.2 * Math.random());
        if (onbsnd) {
            playsnd(18, bmpr);
            onbsnd = false;
        } else {
            playsnd(19, bmpr);
            onbsnd = true;
        }
        bfbump[bi] = 4;
    }
}
var bfcrash = [0, 0, 0, 0];
var lcrlow = -1;
var lcrmed = -1;
var lcrhig = -1;
function crashsnd(cmag, sign) {
    if (sign == 0) {
        if ((bfcrash[0] == 0) && (Math.abs(cmag) > 2.5) && (Math.abs(cmag) < 10)) {
            var crp = Math.floor(Math.random() * 3);
            if (crp == 4) {
                crp = 0;
            }
            while (crp == lcrlow) {
                crp = Math.floor(Math.random() * 3);
                if (crp == 4) {
                    crp = 0;
                }
            }
            playsnd((crp + 14), 1);
            lcrlow = crp;
            bfcrash[0] = 3;
        }
        if ((bfcrash[1] == 0) && (Math.abs(cmag) >= 10) && (Math.abs(cmag) < 17)) {
            var crp = Math.floor(Math.random() * 3);
            if (crp == 4) {
                crp = 0;
            }
            while (crp == lcrmed) {
                crp = Math.floor(Math.random() * 3);
                if (crp == 4) {
                    crp = 0;
                }
            }
            playsnd((crp + 11), 1);
            lcrmed = crp;
            bfcrash[1] = 3;
        }
        if ((bfcrash[2] == 0) && (Math.abs(cmag) >= 17)) {
            var crp = Math.floor(Math.random() * 3);
            if (crp == 4) {
                crp = 0;
            }
            while (crp == lcrhig) {
                crp = Math.floor(Math.random() * 3);
                if (crp == 4) {
                    crp = 0;
                }
            }
            playsnd((crp + 8), 1);
            lcrhig = crp;
            bfcrash[2] = 3;
        }
    }
    if (bfcrash[3] == 0) {
        if (sign == -1) {
            if ((Math.abs(cmag) >= 2.5) && (Math.abs(cmag) < 10)) {
                playsnd(15, 1);
            }
            if ((Math.abs(cmag) >= 10) && (Math.abs(cmag) < 17)) {
                playsnd(12, 1);
            }
            if (Math.abs(cmag) >= 17) {
                playsnd(10, 1);
            }
            bfcrash[3] = 3;
        }
        if (sign == 1) {
            playsnd(17, 1);
            bfcrash[3] = 4;
        }
    }
}
var bfskid = 0;
var sklast = [0, 1];
var dsklast = [0, 1];
function skidsnd(typ, ontsk, gmag) {
    if (bfskid == 0) {
        if (gmag > 10) {
            var spbr = (((gmag - 10) * 0.0363) + 0.8);
            if (spbr < 0.8) {
                spbr = 0.8;
            }
            if (spbr > 1.2) {
                spbr = 1.2;
            }
            if ((ontsk) && (typ == 1) && (Math.random() > Math.random())) {
                typ = 0;
            }
            if (typ == 0) {
                var skp = Math.floor(Math.random() * 4);
                if (skp == 4) {
                    skp = 0;
                }
                while (skp == sklast[0] || skp == sklast[1]) {
                    skp = Math.floor(Math.random() * 4);
                    if (skp == 4) {
                        skp = 0;
                    }
                }
                playsnd(skp, spbr);
                sklast[1] = sklast[0];
                sklast[0] = skp;
            } else {
                var skp = Math.floor(Math.random() * 4);
                if (skp == 4) {
                    skp = 0;
                }
                while (skp == dsklast[0] || skp == dsklast[1]) {
                    skp = Math.floor(Math.random() * 4);
                    if (skp == 4) {
                        skp = 0;
                    }
                }
                playsnd((skp + 4), spbr);
                dsklast[1] = dsklast[0];
                dsklast[0] = skp;
            }
            bfskid = (Math.floor(Math.random() * 20));
            if (bfskid < 5) {
                bfskid = 5;
            }
        }
    }
}
var flexr = 2;
var flexm = 0.2;
var revfase = 0, revat = 0, revto = 0, revup = 0, revdn = 0, revfr = 0, revout = 0;
var doublerev = 0;
var reqvol = 1;
var reqpbr = 1;
var ringr = 10;
function enginsnd() {
    if (engstarted) {
        var atmax = false;
        var pedl = false;
        if (((u[0].up) && (speed[0] > 0)) || ((u[0].down) && (speed[0] < 0))) {
            pedl = true;
        }
        if ((wtouch[0]) && (!capsized[0])) {
            if (mtouch[0]) {
                var flexd = (((skid[0] == 1) && (u[0].handb)) || (Math.abs(scz[0][0] - ((scz[0][1] + scz[0][0] + scz[0][2] + scz[0][3]) / 4)) > 0.1) || (Math.abs(scx[0][0] - ((scx[0][1] + scx[0][0] + scx[0][2] + scx[0][3]) / 4)) > 0.1));
                if (!flexd) {
                    if (pedl) {
                        if ((Math.abs(speed[0]) > 0) && (Math.abs(speed[0]) <= cd.swits[sel[0]][0])) {
                            var amp = (Math.abs(speed[0]) / cd.swits[sel[0]][0]);
                            amp *= amp;
                            reqvol = (1 + amp);
                            reqpbr = (1 + amp);
                        }
                        if ((Math.abs(speed[0]) > cd.swits[sel[0]][0]) && (Math.abs(speed[0]) <= cd.swits[sel[0]][1])) {
                            var amp = ((Math.abs(speed[0]) - cd.swits[sel[0]][0]) / (cd.swits[sel[0]][1] - cd.swits[sel[0]][0]));
                            amp *= amp;
                            reqvol = (1 + amp);
                            if (speed < 0) {
                                amp *= 1.5;
                            }
                            reqpbr = (1.2 + amp);
                            if (reqpbr > 2.1) {
                                reqpbr = 2.1;
                            }
                        }
                        if ((Math.abs(speed[0]) > cd.swits[sel[0]][1]) && (Math.abs(speed[0]) <= cd.swits[sel[0]][2])) {
                            var amp = ((Math.abs(speed[0]) - cd.swits[sel[0]][1]) / (cd.swits[sel[0]][2] - cd.swits[sel[0]][1]));
                            amp *= amp;
                            reqvol = (1 + amp);
                            reqpbr = (1.6 + amp);
                            if (reqpbr > 2.2) {
                                reqpbr = 2.2;
                                atmax = true;
                            }
                        }
                    } else {
                        var amp = (Math.abs(speed[0]) / cd.swits[sel[0]][2]);
                        reqvol = (1 + (amp * 0.5));
                        reqpbr = (1 + amp);
                    }
                    if (flexr != (1 + (1.1 * cd.engrev[sel[0]]))) {
                        flexr = (1 + (1.1 * cd.engrev[sel[0]]));
                        flexm = (0.02 + (0.16 * Math.random()));
                    }
                } else {
                    reqvol = flexr;
                    if (reqvol > 2) {
                        reqvol = 2;
                    }
                    reqpbr = flexr;
                    flexr -= flexm;
                    if (flexr < (1 + (0.5 * cd.engrev[sel[0]]))) {
                        flexr = (1 + (1.1 * cd.engrev[sel[0]]));
                        flexm = (0.02 + (0.16 * Math.random()));
                    }
                }
                if (revfase != 0) {
                    if (revout == 0) {
                        revfase = 0;
                    } else {
                        revout--;
                    }
                }
            }
        } else {
            if (revfase == 0) {
                revout = 20;
                revat = reqpbr;
                revto = (revat + 0.3 + (0.2 * Math.random()));
                if (revto < 2) {
                    revto = 2;
                }
                revup = (0.1 + (0.3 * Math.random()));
                revdn = (0.1 + (0.2 * Math.random()));
                revfr = Math.floor(5 + (5 * Math.random()));
                revfase = 1;
                if (Math.random() > Math.random()) {
                    doublerev = (revto * (0.8 + (0.15 * Math.random())));
                } else {
                    doublerev = 0;
                }
            }
            if (revfase == 1) {
                revat += revup;
                reqvol = revat;
                if (reqvol > 2) {
                    reqvol = 2;
                }
                reqpbr = revat;
                if (revat > revto) {
                    revfase = 2;
                }
            }
            if (revfase == 2) {
                revfr--;
                if (revfr == 0) {
                    revfase = 3;
                }
            }
            if (revfase == 3) {
                revat -= revdn;
                if (revat < doublerev) {
                    revat = revto;
                    doublerev = 0;
                }
                if (revat < 0.5) {
                    revat = 0.5;
                    revfase = 4;
                }
                reqvol = revat;
                if (reqvol > 2) {
                    reqvol = 2;
                }
                reqpbr = revat;
                if (reqpbr < 1.4) {
                    reqpbr = 1.4;
                }
            }
            if ((revfase == 4) && (mtouch[0])) {
                if (pedl) {
                    reqpbr += 0.1;
                } else {
                    reqpbr -= 0.2;
                }
                if (reqpbr > 2) {
                    reqpbr = 2;
                }
                if (reqpbr < 1.4) {
                    reqpbr = 1.4;
                }
                reqvol = (((reqpbr - 1.4) * 2.5) + 0.5);
                if (reqvol > 2) {
                    reqvol = 2;
                }
            }
        }
        if (holdcnt == 0) {
            engvol.gain.value += ((((reqvol - 1) * 0.75) + 1 - engvol.gain.value) / 10);
        } else {
            if (engvol.gain.value > 0.3) {
                engvol.gain.value -= 0.01;
            }
        }
        if (atmax) {
            if (ringr == 0) {
                reqpbr *= 1.06;
                ringr = Math.floor(Math.random() * 50);
            } else {
                ringr--;
            }
        }
        var abo = (reqpbr - 1);
        if (abo < 0) {
            abo = 0;
        }
        engsource.playbackRate.value = (1 + (abo * cd.engrev[sel[0]]));
    } else {
        starteng(true);
    }
    if (bfskid != 0) {
        bfskid--;
    }
    for (var i = 0; i < 4; i++) {
        if (bfcrash[i] != 0) {
            bfcrash[i]--;
        }
    }
    for (var i = 0; i < 2; i++) {
        if (bfbump[i] != 0) {
            bfbump[i]--;
        }
    }
    if (bfscrape != 0) {
        bfscrape--;
    }
    if (bfgscrape != 0) {
        bfgscrape--;
    }
}
function fullscreen() {
    if (isphone) {
        if ((window.innerWidth != screen.width) || (window.innerHeight != screen.height)) {
            if (document.body.requestFullScreen) {
                document.body.requestFullScreen();
            } else {
                if (document.body.webkitRequestFullScreen) {
                    document.body.webkitRequestFullScreen();
                } else {
                    if (document.body.mozRequestFullScreen) {
                        document.body.mozRequestFullScreen();
                    } else {
                        if (document.body.msRequestFullscreen) {
                            document.body.msRequestFullscreen();
                        }
                    }
                }
            }
        }
    }
}
function gotGamepads() {
    if (gpat) {
        gotgamepad = false;
        try {
            if (supportsGamepads()) {
                var gp = navigator.getGamepads();
                for (var i = 0; i < gp.length; i++) {
                    if (gp[i] != null) {
                        gotgamepad = true;
                    }
                }
            }
        } catch (e) {}
        gpat--;
    }
}
function supportsGamepads() {
    return !!(navigator.getGamepads);
}
var onhip = 0;
var noten = 0;
var playedforeplay = false;
function pausedgame() {
    if (engstarted) {
        engsource.loop = false;
        engstarted = false;
    }
    rd.clearRect(0, 0, canw, canh);
    var r = Math.floor(128 - (128 * snap[0]));
    if (r > 255) {
        r = 255;
    }
    if (r < 0) {
        r = 0;
    }
    var g = Math.floor(128 - (128 * snap[1]));
    if (g > 255) {
        g = 255;
    }
    if (g < 0) {
        g = 0;
    }
    var b = Math.floor(128 - (128 * snap[2]));
    if (b > 255) {
        b = 255;
    }
    if (b < 0) {
        b = 0;
    }
    var hsl = rgbToHsl(r, g, b);
    var rgb = hslToRgb(hsl[0], 0.3, 0.2);
    rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    rd.globalAlpha = 0.7;
    rd.fillRect(0, 0, canw, canh);
    rgb = hslToRgb(hsl[0], 1, 0.5);
    rd.globalAlpha = 0.5;
    drawcoolrect((640 * mw), (95 * mh), 400, 400, "#0093F0", "#00F088", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", 1);
    rd.globalAlpha = 1;
    if (onbreplay == 1) {
        rewindreplay();
    }
    var bton = [];
    bton[0] = ["#019DFF", "#01EAFF", "#004A78", "#016D77"];
    bton[1] = ["#01DEFF", "#49FFE3", "#016877", "#017765"];
    var on = 0;
    if (onhip == 0) {
        on = 1;
    }
    if (drawbutton(1, (640 * mw), ((95 * mh) + (35 * avm)), 350, 60, bton[on][0], bton[on][1], bton[on][2], bton[on][3], 0, "Resume Game ", 20, 0.8, btimg[1], 0.8, on)) {
        noten = 0;
        if (!playedforeplay) {
            resumestagetrack();
        } else {
            playedforeplay = false;
        }
        gameplayStart();
        fase = 7;
        requestAnimationFrame(render);
    }
    on = 0;
    if (onhip == 1) {
        on = 1;
    }
    if (drawbutton(2, (640 * mw), ((95 * mh) + (125 * avm)), 350, 60, bton[on][0], bton[on][1], bton[on][2], bton[on][3], 1, "Instant Replay", 20, 0.8, null, 0, on)) {
        if (nrec >= 430) {
            onbreplay = 2;
            resumestagetrack();
            playedforeplay = true;
            noten = 0;
        } else {
            noten = 30;
        }
    }
    on = 0;
    if (onhip == 2) {
        on = 1;
    }
    if (drawbutton(3, (640 * mw), ((95 * mh) + (215 * avm)), 380, 60, bton[on][0], bton[on][1], bton[on][2], bton[on][3], 1, "Game Instructions", 20, 0.8, null, 0, on)) {
        noten = 0;
        if (playedforeplay) {
            stopstagetrack();
            playedforeplay = false;
        }
        instmain = false;
        ifase = 0;
        dudo = 250;
        fase = 5;
    }
    on = 0;
    if (onhip == 3) {
        on = 1;
    }
    if (drawbutton(4, (640 * mw), ((95 * mh) + (305 * avm)), 250, 60, bton[on][0], bton[on][1], bton[on][2], bton[on][3], 1, "x Quit Game", 20, 0.8, null, 0, on)) {
        for (var c = 0; c < ncars; c++) {
            fixcar(c);
        }
        noten = 0;
        if (playedforeplay) {
            stopstagetrack();
            playedforeplay = false;
        }
        showQuitgameAd();
    }
    if (u[0].up) {
        onhip--;
        if (onhip == -1) {
            onhip = 3;
        }
        u[0].up = false;
    }
    if (u[0].down) {
        onhip++;
        if (onhip == 4) {
            onhip = 0;
        }
        u[0].down = false;
    }
    if (noten) {
        if (aflk) {
            rgb = hslToRgb(hsl[0], 1, 0.7);
            aflk = false;
        } else {
            rgb = hslToRgb(hsl[0], 1, 0.6);
            aflk = true;
        }
        drawcs(600, "Not enough gameplay was recorded yet!", rgb[0], rgb[1], rgb[2], 0);
        noten--;
    }
    if (onbreplay) {
        rd.globalAlpha = 0.6;
        rd.fillStyle = "#000000";
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
        onbreplay--;
    }
    if (enter == 1) {
        if (onhip == 0) {
            if (!playedforeplay) {
                resumestagetrack();
            } else {
                playedforeplay = false;
            }
            gameplayStart();
            fase = 7;
            requestAnimationFrame(render);
            noten = 0;
        }
        if (onhip == 1) {
            if (nrec >= 430) {
                onbreplay = 2;
                resumestagetrack();
                playedforeplay = true;
                noten = 0;
            } else {
                noten = 30;
            }
        }
        if (onhip == 2) {
            noten = 0;
            if (playedforeplay) {
                stopstagetrack();
                playedforeplay = false;
            }
            instmain = false;
            ifase = 0;
            dudo = 250;
            fase = 5;
        }
        if (onhip == 3) {
            for (var c = 0; c < ncars; c++) {
                fixcar(c);
            }
            noten = 0;
            if (playedforeplay) {
                stopstagetrack();
                playedforeplay = false;
            }
            showQuitgameAd();
        }
        enter = 2;
    }
    if (!flwg) {
        flw -= 0.03;
        if (flw < 0.5) {
            flw = 0.5;
            flwg = true;
        }
    } else {
        flw += 0.03;
        if (flw > 2) {
            flw = 2;
            flwg = false;
        }
    }
    if (!flhg) {
        flh -= 0.5;
        if (flh < 0.1) {
            flh = 0.1;
            flhg = true;
        }
    } else {
        flh += 0.5;
        if (flh > 2) {
            flh = 2;
            flhg = false;
        }
    }
}
function afterquitgamead() {
    fredo = 0;
    onskip = false;
    fase = 1;
}
var fredo = 0;
var onskip = true;
var canreset = false;
var cnf = 0;
var cnl = 0;
var relit = "RE-LIT";
function drawmain() {
    rd.fillStyle = "#000000";
    rd.fillRect(0, 0, canw, canh);
    if (fredo == 0) {
        playintertrack();
        cnf = 0;
    }
    var lefy = ((canw - (1280 * mh)) / 2);
    var rigy = (lefy + (1280 * mh));
    rd.drawImage(mainbg, lefy, 0, (1280 * mh), canh);
    var ixs = (lefy + (270 * mh)),
    iys = (39 * mh);
    var rxs = (lefy + (520 * mh)),
    rys = (43 * mh);
    var fm = mh;
    var mrg = 1;
    if (lefy < 0) {
        lefy = 0;
        rigy = canw;
        fm = avm;
        mrg = (1 - (0.9752 * ((1 - (mw / mh)) / 0.4375)));
    }
    var ixe = (lefy + (40 * fm)),
    iye = (186 * fm);
    var rxe = (rigy - (520 * fm)),
    rye = (102 * fm);
    var ixf = (((ixs * (25 - cnf)) + (ixe * cnf)) / 25);
    var iyf = (((iys * (25 - cnf)) + (iye * cnf)) / 25);
    var rxf = (((rxs * (25 - cnf)) + (rxe * cnf)) / 25);
    var ryf = (((rys * (25 - cnf)) + (rye * cnf)) / 25);
    if (cnf != 0) {
        rd.globalAlpha = (0.2 + ((cnf / 25) * 0.8));
        rd.drawImage(insano[0], ixf, iyf, (274 * mh), (341 * mh));
        rd.drawImage(rider, rxf, ryf, (386 * mh), (191 * mh));
        rd.globalAlpha = 1;
    }
    if (cnf == 25) {
        rd.drawImage(logo, (lefy + (282 * fm * mrg)), (canh - (464 * fm)), (905 * fm), (258 * fm));
        rd.letterSpacing = "1px";
        rd.font = "" + (24 * (mh + mw)) + "px junk";
        rd.textAlign = "left";
        rd.textBaseline = "middle";
        var grd = rd.createLinearGradient((lefy + (282 * fm * mrg) + (760 * fm)), (canh - (464 * fm) + (150 * fm)), (lefy + (282 * fm * mrg) + (760 * fm) + rd.measureText(relit).width), (canh - (464 * fm) + (150 * fm)));
        grd.addColorStop(0, "#FF5B01");
        grd.addColorStop(1, "#FF9601");
        rd.fillStyle = grd;
        rd.fillText(relit, (lefy + (282 * fm * mrg) + (760 * fm)), (canh - (464 * fm) + (150 * fm)));
        if (cnl == 0) {
            if (relit == "RE-LI T") {
                relit = "RE-LIT";
            }
            if (relit == "RE-LIt") {
                relit = "RE-LI T";
            }
            if (relit == "RE-Lit") {
                relit = "RE-LIt";
            }
            if (relit == "RE-lit") {
                relit = "RE-Lit";
            }
            if (relit == "Re-lit") {
                relit = "RE-lit";
            }
            if (relit == "re-lit") {
                relit = "Re-lit";
            }
            if (relit == "re-liT") {
                relit = "re-lit";
            }
            if (relit == "re-lIT") {
                relit = "re-liT";
            }
            if (relit == "re-LIT") {
                relit = "re-lIT";
            }
            if (relit == "rE-LIT") {
                relit = "re-LIT";
            }
            if (relit == "RE-LIT") {
                relit = "rE-LIT";
            }
            cnl = 1;
        } else {
            cnl--;
        }
    }
    if (!onskip) {
        if (drawbutton(1, (rigy - (230 * avm)), ((720 * mh) - (200 * avm)), 360, 60, "#FF1301", "#FF8A01", "#780800", "#784100", 1, "Game Instructions", 19, 0.9, null, 0, false)) {
            pauseintertrack();
            instmain = true;
            ifase = 0;
            dudo = 250;
            fase = 5;
        }
        if (drawbutton(3, (rigy - (150 * avm)), ((720 * mh) - (100 * avm)), 200, 70, "#FF3D01", "#FFB401", "#771D01", "#775401", 0, "PLAY ", 25, 0.9, btimg[1], 0.9, true)) {
            fredo = 29;
            cnf = 25;
        }
        if (fredo < 29) {
            if (enter == 1) {
                fredo = 29;
                enter = 2;
            }
        }
        if (canreset) {
            if (drawbutton(4, (rigy - (450 * avm)), ((720 * mh) - (90 * avm)), 280, 60, "#FF1301", "#FF8A01", "#780800", "#784100", 1, "Reset Game", 22, 0.9, null, 0, 0, false)) {
                dudo = 250;
                fase = 13;
            }
        }
        musictog();
    }
    if (!onskip) {
        if (fredo != 15) {
            fredo++;
        } else {
            if (cnf != 25) {
                cnf++;
            }
        }
    } else {
        cnf = 25;
        fredo++;
        if (fredo == 15) {
            fredo = 29;
        }
    }
    if (fredo >= 30) {
        rd.globalAlpha = ((fredo - 50) / 10);
        rd.fillStyle = "#000000";
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
        if (fredo == 40) {
            gotGamepads();
            flyout = 1;
            carms = 0;
            carmy = 100;
            snap = [0, -0.05, 0.6];
            var fogc = [0, 0, 0];
            var lvx = 0,
            lvy = 0.866,
            lvz = -0.5;
            var fogdist = 10700;
            setworld(snap, fogc, lvx, lvy, lvz, fogdist);
            fase = 2;
            requestAnimationFrame(render);
        }
    }
    if (!flwg) {
        flw -= 0.03;
        if (flw < 0.5) {
            flw = 0.5;
            flwg = true;
        }
    } else {
        flw += 0.03;
        if (flw > 2) {
            flw = 2;
            flwg = false;
        }
    }
    if (!flhg) {
        flh -= 0.5;
        if (flh < 0.1) {
            flh = 0.1;
            flhg = true;
        }
    } else {
        flh += 0.5;
        if (flh > 2) {
            flh = 2;
            flhg = false;
        }
    }
}
var instmain = false;
var ifase = 0;
var ondud = 0;
var dudo = 0;
function gameinstructions() {
    rd.fillStyle = "#000000";
    rd.fillRect(0, 0, canw, canh);
    if (instmain) {
        var lefy = ((canw - (1280 * mh)) / 2);
        rd.drawImage(mainbg, lefy, 0, (1280 * mh), canh);
    } else {
        rd.clearRect(0, 0, canw, canh);
        var r = Math.floor(128 - (128 * snap[0]));
        if (r > 255) {
            r = 255;
        }
        if (r < 0) {
            r = 0;
        }
        var g = Math.floor(128 - (128 * snap[1]));
        if (g > 255) {
            g = 255;
        }
        if (g < 0) {
            g = 0;
        }
        var b = Math.floor(128 - (128 * snap[2]));
        if (b > 255) {
            b = 255;
        }
        if (b < 0) {
            b = 0;
        }
        var hsl = rgbToHsl(r, g, b);
        var rgb = hslToRgb(hsl[0], 0.3, 0.2);
        rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        rd.globalAlpha = 0.7;
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
    }
    var fm = mw;
    if ((mw / mh) > 1.2) {
        fm *= (1.2 / (mw / mh));
    }
    if (aflk) {
        aflk = false;
    } else {
        aflk = true;
    }
    if (dudo > 0) {
        if (aflk) {
            ondud = Math.floor(Math.random() * 6);
            if (ondud == 6) {
                ondud = 5;
            }
        }
        dudo--;
    } else {
        ondud = 2;
    }
    rd.drawImage(insano[ondud], (10 * fm), (260 * mh), (274 * fm * 0.7), (341 * fm * 0.7));
    var topo = ((260 * mh) - (200 * fm));
    rd.fillStyle = "#FFFFFF";
    rd.globalAlpha = 0.7;
    floatytalk((200 * fm), topo, (1060 * fm), (570 * fm), (20 * fm));
    rd.globalAlpha = 1;
    if (ifase == 0) {
        rd.letterSpacing = "1px";
        rd.font = "" + (30 * fm) + "px junk";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("Welcome to  Need for Madness !", ((200 * fm) + (20 * fm)), (topo + (30 * fm)));
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.fillText("In this game there are two ways to complete a stage.", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
        rd.fillText("One is by racing and finishing in first place, the other is by", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
        rd.fillText("wasting and crashing all the other cars in the stage!", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
        rd.letterSpacing = "1px";
        rd.font = "" + (40 * fm) + "px junk";
        rd.fillText("Racing", ((200 * fm) + (80 * fm)), (topo + (220 * fm)));
        rd.fillText("Wasting", ((200 * fm) + (130 * fm) + (485 * fm)), (topo + (220 * fm)));
        rd.font = "" + (35 * fm) + "px junk";
        rd.fillText("OR", ((200 * fm) + (511 * fm)), (topo + (340 * fm)));
        rd.drawImage(inst[0], ((200 * fm) + (20 * fm)), (topo + (190 * fm)), (485 * fm), (265 * fm));
        rd.drawImage(inst[1], ((200 * fm) + (70 * fm) + (485 * fm)), (topo + (249 * fm)), (485 * fm), (206 * fm));
    }
    if (ifase == 1) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("Whether you are racing or wasting, you will need to", ((200 * fm) + (20 * fm)), (topo + (56 * fm)));
        rd.fillText("power up your car.", ((200 * fm) + (20 * fm)), (topo + (96 * fm)));
        rd.fillText("The more powered your car is, the stronger and faster", ((200 * fm) + (20 * fm)), (topo + (136 * fm)));
        rd.fillText("it becomes! Which is helpful when racing or wasting.", ((200 * fm) + (20 * fm)), (topo + (176 * fm)));
        rd.fillText("To power up your car (and keep it powered up) you will need to", ((200 * fm) + (20 * fm)), (topo + (256 * fm)));
        rd.fillText("perform stunts!", ((200 * fm) + (20 * fm)), (topo + (296 * fm)));
        rd.font = "" + (50 * fm) + "px verd";
        rd.fillText("=", (770 * fm), (topo + (310 * fm) + (55 * avm)));
        rd.drawImage(inst[4], ((200 * fm) + (90 * fm)), (topo + (300 * fm)), (464 * fm), (150 * fm));
        rd.letterSpacing = "1px";
        rd.font = "" + (11 * (mh + mw)) + "px junk";
        rd.textAlign = "right";
        rd.fillStyle = "#000000";
        rd.fillText("Power", ((945 * fm) - (15 * avm)), (topo + (310 * fm) + (55 * avm)));
        var r = 128;
        var g = (190 + (70 * 0.37));
        var b = 255;
        drawbar((945 * fm), (topo + (310 * fm) + (42 * avm)), "#00B0DC", "#005C96", "rgb(" + r + "," + g + "," + b + ")", (70 / 98));
    }
    if (ifase == 2) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("When wasting cars, to help you find the other cars in the stage,", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
        rd.fillText("press the 'Arrow Target' button to toggle the guidance arrow", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
        rd.fillText("from pointing to the track to pointing to the cars.", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
        rd.fillText("When your car is damaged, you can fix it (and reset its 'Damage')", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
        rd.fillText("by jumping through the electrified hoop.", ((200 * fm) + (20 * fm)), (topo + (196 * fm)));
        rd.drawImage(inst[2], ((200 * fm) + (150 * fm)), (topo + (233 * fm)), (402 * fm), (231 * fm));
        rd.drawImage(inst[3], ((200 * fm) + (600 * fm)), (topo + (180 * fm)), (376 * fm), (284 * fm));
    }
    if (ifase == 3) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        if (!isphone) {
            rd.fillText("Drive your car using the keyboard arrows and also use the", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
            rd.fillText("keyboard arrows when your car is in the air to perform stunts.", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
            rd.fillText("Press Spacebar for Handbrakes to drift while turning and make", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
            rd.fillText("quick 180 turns.", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
            rd.drawImage(inst[6], ((200 * fm) + (200 * fm)), (topo + (220 * fm)), (345 * fm), (77 * fm));
            rd.drawImage(inst[5], ((200 * fm) + (670 * fm)), (topo + (170 * fm)), (220 * fm), (155 * fm));
            rd.drawImage(inst[7], ((200 * fm) + (50 * fm)), (topo + (380 * fm)), (95 * fm), (65 * fm));
            rd.fillText("(Gamepad & Joystick control is also possible.)", ((200 * fm) + (167 * fm)), (topo + (420 * fm)));
        } else {
            rd.fillText("Drive your car using the arrow buttons on the screen.", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
            rd.fillText("Also use them when your car is in the air to perform stunts.", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
            rd.drawImage(contimg[0], ((200 * fm) + (150 * fm)), (topo + (110 * fm)), (128 * fm), (128 * fm));
            rd.drawImage(contimg[1], ((200 * fm) + (300 * fm)), (topo + (110 * fm)), (128 * fm), (128 * fm));
            rd.drawImage(contimg[3], ((200 * fm) + (550 * fm)), (topo + (110 * fm)), (128 * fm), (128 * fm));
            rd.drawImage(contimg[2], ((200 * fm) + (700 * fm)), (topo + (110 * fm)), (128 * fm), (128 * fm));
            rd.fillText("Press the Handbrake button while turning to drift and make", ((200 * fm) + (20 * fm)), (topo + (290 * fm)));
            rd.fillText("quick 180 turns.", ((200 * fm) + (20 * fm)), (topo + (330 * fm)));
            rd.drawImage(contimg[4], ((200 * fm) + (330 * fm)), (topo + (330 * fm)), (154 * fm), (111 * fm));
        }
    }
    if (ifase == 4) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("And finally my name is Coach Insano, and I am here to help you", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
        rd.fillText("and guide you to become the greatest Need for Madness driver", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
        rd.fillText("you can be!", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
        rd.fillText("I will also offer you hints and tips on the ideal strategy to", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
        rd.fillText("complete each stage. Good luck!", ((200 * fm) + (20 * fm)), (topo + (196 * fm)));
        if (!isphone) {
            if (drawbutton(1, ((240 * fm) + (285 * avm)), (topo + (250 * fm)), 570, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 1, "Additional Keyboard Controls", 18, 0.9, null, 0, false)) {
                dudo = 250;
                ifase++;
            }
            if (drawbutton(2, ((240 * fm) + (140 * avm)), (topo + (350 * fm)), 280, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 1, "Music Credits", 18, 0.9, null, 0, false)) {
                dudo = 250;
                ifase += 2;
            }
        } else {
            if (drawbutton(2, ((240 * fm) + (140 * avm)), (topo + (300 * fm)), 280, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 1, "Music Credits", 18, 0.9, null, 0, false)) {
                dudo = 250;
                ifase += 2;
            }
        }
    }
    if (ifase == 5) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("Additional Keyboard Controls", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
        rd.fillText("[X] & [Z] to look back while driving.", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
        rd.fillText("[Q] to toggle the guidance arrow by Keyboard.", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
        rd.fillText("[W], [A], [S] & [D] can also be used instead of Keyboard arrows.", ((200 * fm) + (20 * fm)), (topo + (196 * fm)));
        rd.fillText("[V] for cinematic camera views while driving.", ((200 * fm) + (20 * fm)), (topo + (236 * fm)));
        rd.fillText("[M] to mute music.", ((200 * fm) + (20 * fm)), (topo + (276 * fm)));
        rd.fillText("[N] to mute sound effects.", ((200 * fm) + (20 * fm)), (topo + (316 * fm)));
        rd.fillText("[Enter] & [Esc] to navigate and pause game.", ((200 * fm) + (20 * fm)), (topo + (356 * fm)));
        if (enter == 1) {
            ifase = 4;
            dudo = 250;
            enter = 2;
        }
    }
    if (ifase == 6) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("Music Credits", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
        rd.fillText("Interface and Game Menus: Neon Nox - Shift", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
        rd.fillText("Stage 1: Alpharisc - Video Disco", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
        rd.fillText("Stage 2: Sferro & Tommy '86 - We Been 'Round", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
        rd.fillText("Stage 3: Jeremiah Kane - All or Nothing", ((200 * fm) + (20 * fm)), (topo + (196 * fm)));
        rd.fillText("Stage 4: Wolf and Raven - Cyber Samurai", ((200 * fm) + (20 * fm)), (topo + (236 * fm)));
        rd.fillText("Stage 5: Bestrack - Burn the Night", ((200 * fm) + (20 * fm)), (topo + (276 * fm)));
        rd.fillText("Stage 6: Midnight Fury - Arcade Hero", ((200 * fm) + (20 * fm)), (topo + (316 * fm)));
        rd.fillText("Stage 7: DEADLIFE - Punished Survivor", ((200 * fm) + (20 * fm)), (topo + (356 * fm)));
        rd.fillText("Stage 8: Jeremiah Kane - Street Warriors (feat. FAVORIT89)", ((200 * fm) + (20 * fm)), (topo + (396 * fm)));
        if (drawbutton(1, ((1170 * fm) - (75 * avm)), (topo + (430 * fm)), 150, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 0, "Next ", 18, 0.9, btimg[2], 0.9, true)) {
            dudo = 250;
            ifase++;
        }
        if (enter == 1) {
            ifase++;
            dudo = 250;
            enter = 2;
        }
    }
    if (ifase == 7) {
        rd.letterSpacing = "0px";
        rd.font = "" + (30 * fm) + "px verd";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#002748";
        rd.fillText("Music Credits", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
        rd.fillText("Stage 9: DEADLIFE - We Are One & The Same", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
        rd.fillText("Stage 10: Wice - Star Fighter", ((200 * fm) + (20 * fm)), (topo + (116 * fm)));
        rd.fillText("Stage 11: Neon Nox - The Stash", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
        rd.fillText("Stage 12: Neon Nox vs Powernerd - Dopamine", ((200 * fm) + (20 * fm)), (topo + (196 * fm)));
        rd.fillText("Stage 13: Dreamhour - Small Town Vengeance", ((200 * fm) + (20 * fm)), (topo + (236 * fm)));
        rd.fillText("Stage 14: LazerHawk - King of The Streets", ((200 * fm) + (20 * fm)), (topo + (276 * fm)));
        rd.fillText("Stage 15: Jeremiah Kane - Vampirevania", ((200 * fm) + (20 * fm)), (topo + (316 * fm)));
        rd.fillText("Stage 16: Jeremiah Kane - SPECTER", ((200 * fm) + (20 * fm)), (topo + (356 * fm)));
        rd.fillText("Stage 17: Midnight Danger - Radio Hell", ((200 * fm) + (20 * fm)), (topo + (396 * fm)));
        if (enter == 1) {
            ifase = 4;
            dudo = 250;
            enter = 2;
        }
    }
    if (ifase > 0) {
        if (drawbutton(4, ((240 * fm) + (75 * avm)), (topo + (560 * fm) - (65 * avm)), 150, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 3, " Back", 18, 0.9, btimg[3], 0.9, false)) {
            if (ifase == 7) {
                ifase--;
            }
            if (ifase == 6) {
                ifase--;
            }
            ifase--;
            dudo = 250;
        }
    }
    if (ifase < 4) {
        if (drawbutton(3, ((1280 * fm) - (70 * fm) - (100 * avm)), (topo + (560 * fm) - (65 * avm)), 200, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 0, "Next ", 20, 0.9, btimg[1], 0.9, true)) {
            ifase++;
            dudo = 250;
        }
        if (enter == 1) {
            ifase++;
            dudo = 250;
            enter = 2;
        }
    }
    if (ifase == 4) {
        if (drawbutton(3, ((1280 * fm) - (70 * fm) - (110 * avm)), (topo + (560 * fm) - (65 * avm)), 220, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 0, "Finish ", 20, 0.9, btimg[1], 0.9, true)) {
            if (instmain) {
                fase = 1;
                playintertrack();
            } else {
                fase = 11;
            }
        }
        if (enter == 1) {
            if (instmain) {
                fase = 1;
                playintertrack();
            } else {
                fase = 11;
            }
            enter = 2;
        }
    }
    var onabtn = false;
    var mnms = nms;
    if (mnms < 1) {
        mnms = 1;
    }
    for (var i = 0; i < mnms; i++) {
        if (wasonit[i] != 0) {
            onabtn = true;
        }
    }
    if ((!onabtn) && (mdown)) {
        if (instmain) {
            fase = 1;
            playintertrack();
        } else {
            fase = 11;
        }
        mdown = false;
    }
}
function resetgame() {
    rd.fillStyle = "#000000";
    rd.fillRect(0, 0, canw, canh);
    var lefy = ((canw - (1280 * mh)) / 2);
    rd.drawImage(mainbg, lefy, 0, (1280 * mh), canh);
    var fm = mw;
    if ((mw / mh) > 1.2) {
        fm *= (1.2 / (mw / mh));
    }
    if (aflk) {
        aflk = false;
    } else {
        aflk = true;
    }
    if (dudo > 0) {
        if (aflk) {
            ondud = Math.floor(Math.random() * 6);
            if (ondud == 6) {
                ondud = 5;
            }
        }
        dudo--;
    } else {
        ondud = 2;
    }
    rd.drawImage(insano[ondud], (10 * fm), (260 * mh), (274 * fm * 0.7), (341 * fm * 0.7));
    var topo = ((260 * mh) - (200 * fm));
    rd.fillStyle = "#FFFFFF";
    rd.globalAlpha = 0.7;
    floatytalk((200 * fm), topo, (1060 * fm), (570 * fm), (20 * fm));
    rd.globalAlpha = 1;
    rd.letterSpacing = "0px";
    rd.font = "" + (30 * fm) + "px verd";
    rd.textBaseline = "middle";
    rd.textAlign = "left";
    rd.fillStyle = "#002748";
    rd.fillText("Reset your Game", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
    rd.fillText("Would you like to play the game from the beginning again?", ((200 * fm) + (20 * fm)), (topo + (76 * fm)));
    rd.fillText("Note! This will delete all your saved unlocked cars and stages", ((200 * fm) + (20 * fm)), (topo + (156 * fm)));
    rd.fillText("and will start the game like it was never played before!", ((200 * fm) + (20 * fm)), (topo + (196 * fm)));
    rd.fillText("Challenge yourself again and reset the game now?", ((200 * fm) + (20 * fm)), (topo + (276 * fm)));
    if (drawbutton(3, (730 * fm), (topo + (410 * fm) - (65 * avm)), 500, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 1, "Yes! Reset my game now", 20, 0.9, null, 0, false)) {}
    if (drawbutton(4, ((240 * fm) + (100 * avm)), (topo + (560 * fm) - (65 * avm)), 200, 60, "#0075D8", "#299DFF", "#003F74", "#006AC4", 3, " Cancel", 18, 0.9, btimg[3], 0.9, false)) {
        fase = 1;
    }
}
var wasu = false, wasd = false, wasl = false, wasr = false, wash = false, wast = false;
var unlocked = 1;
var rewlocked = [1, 1, 1, 1];
var tiplocked = 0;
var sel = [0, 0, 0, 0, 0, 0, 0];
var ncars = 4;
var im = 0;
var oncheckpoint = -1;
var onlastcheck = false;
var chkflk = 0;
var arrace = false;
var ana = 0, cntan = 0, cntovn = 0;
var flk = false;
var winner = false;
var starcnt = 0;
var iclear = 0;
var holdcnt = 0;
var gocnt = 0;
var gocntdrop = 0;
var looped = 1;
var tcnt = 30;
var tflk = false;
var say = "";
var wasay = false;
var adj = [["Cool", "Alright", "Nice"], ["Wicked", "Amazing", "Super"], ["Awesome", "Ripping", "Radical"], ["What the...?", "You're a super star!!!!", "Who are you again...?"], ["surf style", "off the lip", "bounce back"]];
var exlm = ["!", "!!", "!!!"];
var loopin = "", spin = "", asay = "";
var auscnt = 45;
var aflk = false;
var pwcnt = 0;
var pwflk = false;
var dmcnt = 0;
var dmflk = false;
var cntwis = 0;
var dested = [];
var onbreplay = 0;
var flw = 2;
var flh = 1;
var flwg = false;
var flhg = false;
function inishinter() {
    oncheckpoint = -1;
    onlastcheck = false;
    chkflk = 0;
    arrace = false;
    ana = 0;
    cntan = 0;
    cntovn = 0;
    tcnt = 30;
    wasay = false;
    pwcnt = 0;
    auscnt = 45;
    pnext = 0;
    pback = 0;
    starcnt = 186;
    gocnt = 0;
    gocntdrop = 0;
    iclear = 0;
    for (var i = 0; i < 7; i++) {
        dested[i] = 0;
    }
    holdcnt = 0;
    camode = 0;
    cim = 0;
    onpausefr = false;
    cntwis = 0;
    dmcnt = 0;
    onbreplay = 0;
    flw = 2;
    flh = 0.5;
    for (var i = 0; i < 7; i++) {
        u[i].arrace = false;
        u[i].zyinv = false;
    }
}
function drawinter() {
    rd.clearRect(0, 0, canw, canh);
    if (isphone) {
        if (wasl) {
            rd.globalAlpha = 0.4;
        }
        rd.drawImage(contimg[0], ((130 * mw) - (64 * avm)), ((622 * mh) - (128 * avm)), (128 * avm), (128 * avm));
        rd.globalAlpha = 1;
        if (wasr) {
            rd.globalAlpha = 0.4;
        }
        rd.drawImage(contimg[1], ((320 * mw) - (64 * avm)), ((662 * mh) - (128 * avm)), (128 * avm), (128 * avm));
        rd.globalAlpha = 1;
        if (wasu) {
            rd.globalAlpha = 0.4;
        }
        rd.drawImage(contimg[3], ((1150 * mw) - (64 * avm)), ((622 * mh) - (128 * avm)), (128 * avm), (128 * avm));
        rd.globalAlpha = 1;
        if (wasd) {
            rd.globalAlpha = 0.4;
        }
        rd.drawImage(contimg[2], ((960 * mw) - (64 * avm)), ((662 * mh) - (128 * avm)), (128 * avm), (128 * avm));
        rd.globalAlpha = 1;
        if (wash) {
            rd.globalAlpha = 0.4;
        }
        rd.drawImage(contimg[4], ((1260 * mw) - (154 * avm)), ((440 * mh) - (111 * avm)), (154 * avm), (111 * avm));
        rd.globalAlpha = 1;
        if ((ncars != 1) && (cp.stage != 1 || unlocked != 1)) {
            if (wast) {
                rd.globalAlpha = 0.4;
            }
            rd.drawImage(contimg[5], (20 * mw), ((440 * mh) - (111 * avm)), (154 * avm), (111 * avm));
            rd.globalAlpha = 1;
        }
        if (wasu) {
            u[im].up = false;
            wasu = false;
        }
        if (wasd) {
            u[im].down = false;
            wasd = false;
        }
        if (wasl) {
            u[im].left = false;
            wasl = false;
        }
        if (wasr) {
            u[im].right = false;
            wasr = false;
        }
        if (wash) {
            u[im].handb = false;
            wash = false;
        }
        var notwast = 0;
        if (mdown) {
            for (var i = 0; i < nms; i++) {
                var onkbt = false;
                var onkb = -1;
                var xpr = [(130 * mw), (320 * mw), (1150 * mw), (960 * mw), ((1260 * mw) - (77 * avm)), ((20 * mw) + (77 * avm))];
                var ypr = [((622 * mh) - (64 * avm)), ((662 * mh) - (64 * avm)), ((622 * mh) - (64 * avm)), ((662 * mh) - (64 * avm)), ((440 * mh) - (55.5 * avm)), ((440 * mh) - (55.5 * avm))];
                var pyclos = (200 * avm);
                var nkb = 6;
                if (ncars == 1) {
                    nkb = 5;
                }
                if ((cp.stage == 1) && (unlocked == 1)) {
                    nkb = 5;
                }
                for (var k = 0; k < nkb; k++) {
                    var pypr = py(xpr[k], xm[i], ypr[k], ym[i]);
                    if (pypr < pyclos) {
                        pyclos = pypr;
                        onkb = k;
                    }
                }
                if (onkb == 0) {
                    u[im].left = true;
                    wasl = true;
                }
                if (onkb == 1) {
                    u[im].right = true;
                    wasr = true;
                }
                if (onkb == 2) {
                    u[im].up = true;
                    wasu = true;
                }
                if (onkb == 3) {
                    u[im].down = true;
                    wasd = true;
                }
                if (onkb == 4) {
                    u[im].handb = true;
                    wash = true;
                }
                if (onkb == 5) {
                    if (!wast) {
                        if (u[0].arrace) {
                            u[0].arrace = false;
                        } else {
                            u[0].arrace = true;
                        }
                        wast = true;
                    }
                    onkbt = true;
                }
            }
            if (!onkbt) {
                notwast++;
            }
        }
        if (notwast == nms) {
            wast = false;
        }
    }
    var holdit = false;
    if ((cp.wasted == (ncars - 1)) && (ncars != 1)) {
        drawcs(132, "You Wasted'em!", 0, 0, 0, 3);
        if (aflk) {
            drawcs(192, "You Won, all cars have been wasted!", 0, 0, 0, 0);
            aflk = false;
        } else {
            drawcs(192, "You Won, all cars have been wasted!", 0, 128, 255, 0);
            aflk = true;
        }
        if (!cp.haltall) {
            playsnd(33, 1);
        }
        cp.haltall = true;
        holdit = true;
        winner = true;
    }
    if (!holdit) {
        if ((dest[0]) && (cntwis == 16)) {
            drawcs(132, "You're Wasted!", 0, 0, 0, 3);
            holdit = true;
            winner = false;
        }
    }
    if ((cntdest[0] != 0) && (cntwis < 16)) {
        cntwis++;
        if (cntwis == 1) {
            playsnd(31, 1);
        }
        if (cntwis == 16) {
            playsnd(30, 1);
        }
    }
    if (!holdit) {
        for (var i = 0; i < ncars; i++) {
            if ((cp.clear[i] == (cp.nlaps * cp.nsp)) && (cp.pos[i] == 0)) {
                if (i == im) {
                    drawcs(132, "You Won!", 0, 0, 0, 3);
                    if (aflk) {
                        drawcs(192, "You finished first, nice job!", 0, 0, 0, 0);
                        aflk = false;
                    } else {
                        drawcs(192, "You finished first, nice job!", 0, 128, 255, 0);
                        aflk = true;
                    }
                    winner = true;
                    if (!cp.haltall) {
                        playsnd(32, 1);
                    }
                } else {
                    drawcs(132, "You Lost!", 0, 0, 0, 3);
                    if (aflk) {
                        drawcs(192, "" + cd.names[sel[i]] + " finished first, race over!", 0, 0, 0, 0);
                        aflk = false;
                    } else {
                        drawcs(192, "" + cd.names[sel[i]] + " finished first, race over!", 0, 128, 255, 0);
                        aflk = true;
                    }
                    winner = false;
                }
                cp.haltall = true;
                holdit = true;
            }
        }
    }
    if (holdit) {
        holdcnt++;
        var exitnow = false;
        if ((u[0].handb) && (holdcnt > 50)) {
            exitnow = true;
            u[0].handb = false;
        }
        if (enter == 1) {
            exitnow = true;
            enter = 2;
        }
        if (holdcnt == 100) {
            exitnow = true;
        }
        if (exitnow) {
            if (engstarted) {
                engsource.loop = false;
                engstarted = false;
            }
            stopstagetrack();
            showEndgameAd();
        }
    } else {
        if (holdcnt != 0) {
            holdcnt = 0;
        }
        if ((enter == 1) && (starcnt <= 65)) {
            enter = 2;
            onhip = 0;
            stopstagetrack();
            gameplayStop();
            if (engstarted) {
                engsource.loop = false;
                engstarted = false;
            }
            fase = 11;
        }
    }
    if (starcnt <= 65) {
        if ((ncars != 1) && (arrace != u[im].arrace) && (cp.stage != 16)) {
            arrace = u[im].arrace;
            if (arrace) {
                wasay = true;
                say = " Arrow now pointing at >  CARS";
                tcnt = -5;
            }
            if (!arrace) {
                wasay = false;
                say = " Arrow now pointing at >  TRACK";
                tcnt = -5;
                cntan = 20;
            }
        }
        if ((!holdit) && (starcnt == 0) && (camode == 0) && (cp.stage != 16)) {
            arrow(point[im], missedcp[im], arrace);
            if ((!arrace) && (auscnt == 45) && (capcnt[im] == 0)) {
                if (missedcp[im] > 0) {
                    if ((missedcp[im] > 15) && (missedcp[im] < 50)) {
                        if (flk) {
                            drawcs(112, "Check Point Missed!", 255, 0, 0, 1);
                        } else {
                            drawcs(112, "Check Point Missed!", 255, 128, 0, 2);
                        }
                    }
                    if (frgm >= m) {
                        missedcp[im]++;
                        if (missedcp[im] == 70) {
                            missedcp[im] = -2;
                        }
                    }
                } else {
                    if ((mtouch[im]) && (cntovn < 70)) {
                        if (frgm >= m) {
                            if (Math.abs(ana) > 100) {
                                cntan++;
                            } else {
                                if (cntan != 0) {
                                    cntan--;
                                }
                            }
                        }
                        if (cntan > 40) {
                            if (frgm >= m) {
                                cntovn++;
                            }
                            cntan = 40;
                            if (flk) {
                                drawcs(112, "Wrong Way!", 255, 128, 0, 1);
                                flk = false;
                            } else {
                                drawcs(112, "Wrong Way!", 255, 0, 0, 2);
                                flk = true;
                            }
                        }
                    }
                }
            }
        }
        rd.letterSpacing = "1px";
        rd.font = "" + (11 * (mh + mw)) + "px junk";
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#000000";
        rd.fillText("Lap", (20 * avm), (19 * avm));
        rd.fillText("Wasted", (130 * avm), (19 * avm));
        var adln = 0;
        if (isphone) {
            adln = 70;
        }
        rd.fillText("Position", ((60 + adln) * avm), (55 * avm));
        rd.letterSpacing = "2px";
        rd.fillStyle = "#000078";
        rd.fillText("" + (nlaps[0] + 1) + "/" + cp.nlaps + "", (68 * avm), (19 * avm));
        rd.fillText("" + cp.wasted + "/" + (ncars - 1) + "", (217 * avm), (19 * avm));
        var rank = "th";
        if (cp.pos[0] == 2) {
            rank = "rd";
        }
        if (cp.pos[0] == 1) {
            rank = "nd";
        }
        if (cp.pos[0] == 0) {
            rank = "st";
        }
        rd.letterSpacing = "1px";
        rd.font = "" + (15 * (mh + mw)) + "px junk";
        rd.fillText("" + (cp.pos[0] + 1), ((157 + adln) * avm), (56 * avm));
        rd.font = "" + (11 * (mh + mw)) + "px junk";
        rd.fillStyle = "#000000";
        rd.fillText(rank, ((176 + adln) * avm), (55 * avm));
        if ((!isphone) && (ncars != 1) && (cp.stage != 1 || unlocked != 1)) {
            if (arrace) {
                if (drawbutton(1, (80 * avm), (90 * avm), 100, 60, "#7DBDFF", "#7872FF", "#1767B9", "#2018C2", 0, "A", 22, 0.76, btimg[0], 1, false)) {
                    u[0].arrace = false;
                }
            } else {
                if (drawbutton(1, (80 * avm), (90 * avm), 100, 60, "#89C800", "#CADC00", "#4B6E00", "#778200", 0, "A", 22, 0.76, btimg[0], 1, false)) {
                    u[0].arrace = true;
                }
            }
        }
        var lalign = (canw - (290 * avm));
        if ((canw / canh) < 1.3) {
            lalign = (canw - (200 * avm));
        }
        rd.font = "" + (11 * (mh + mw)) + "px junk";
        rd.textAlign = "right";
        rd.fillStyle = "#000000";
        rd.fillText("Damage", (lalign - (15 * avm)), (19 * avm));
        rd.fillText("Power", (lalign - (15 * avm)), (55 * avm));
        var trav = (98 * (hitmag[0] / cd.maxmag[car[0].typ]));
        if (trav > 98) {
            trav = 98;
        }
        var r = 255;
        var g = 200;
        var b = 0;
        if (trav > 33) {
            g = (200 - (189 * ((trav - 33) / 65)));
        }
        if (trav > 70) {
            if (dmcnt < 10) {
                if (dmflk) {
                    g = 170;
                    dmflk = false;
                } else {
                    dmflk = true;
                }
            }
            if (frgm >= m) {
                dmcnt++;
            }
            if (dmcnt > (167 - (trav * 1.5))) {
                dmcnt = 0;
            }
        }
        drawbar(lalign, (6 * avm), "#FC4D00", "#B20000", "rgb(" + r + "," + g + "," + b + ")", (trav / 98));
        r = 128;
        if (power[0] == 98) {
            r = 64;
        }
        g = (190 + (power[0] * 0.37));
        b = 255;
        if ((auscnt < 45) && (aflk)) {
            r = 128;
            g = 244;
            b = 255;
        }
        drawbar(lalign, (42 * avm), "#00B0DC", "#005C96", "rgb(" + r + "," + g + "," + b + ")", (power[0] / 98));
        var adwn = 0;
        if ((canw / canh) < 1.3) {
            adwn = (76 * avm);
        }
        var onycl = oncla(2, (canw - (87 * avm)), ((10 * avm) + adwn), (77 * avm), (53 * avm));
        if (onycl != 2) {
            rd.drawImage(muimg[onycl], (canw - (87 * avm)), ((10 * avm) + adwn), (77 * avm), (53 * avm));
        } else {
            if (!holdit) {
                onhip = 0;
                stopstagetrack();
                gameplayStop();
                if (engstarted) {
                    engsource.loop = false;
                    engstarted = false;
                }
                fase = 11;
            }
        }
        onycl = oncla(3, (canw - (77.5 * avm)), ((73 * avm) + adwn), (58 * avm), (42 * avm));
        if (onycl == 1) {
            rd.globalAlpha = 0.5;
        }
        if (onycl == 2) {
            if (!mutegame) {
                mutegame = true;
                if (engstarted) {
                    engsource.loop = false;
                    engstarted = false;
                }
            } else {
                mutegame = false;
            }
        }
        if (!mutegame) {
            onycl = 2;
        } else {
            onycl = 3;
        }
        rd.drawImage(muimg[onycl], (canw - (77.5 * avm)), ((73 * avm) + adwn), (58 * avm), (42 * avm));
        rd.globalAlpha = 1;
        onycl = oncla(4, (canw - (77.5 * avm)), ((125 * avm) + adwn), (58 * avm), (42 * avm));
        if (onycl == 1) {
            rd.globalAlpha = 0.5;
        }
        if (onycl == 2) {
            if (!mutemusic) {
                mutemusic = true;
            } else {
                mutemusic = false;
            }
            if (mutestart) {
                mutestart = false;
            }
        }
        if (!mutemusic) {
            onycl = 4;
        } else {
            onycl = 5;
        }
        rd.drawImage(muimg[onycl], (canw - (77.5 * avm)), ((125 * avm) + adwn), (58 * avm), (42 * avm));
        rd.globalAlpha = 1;
    }
    if (!holdit) {
        if ((starcnt != 0 || gocntdrop > 4) && (starcnt < 65)) {
            if (starcnt == 63) {
                gocnt = 3;
                gocntdrop = 16;
                playsnd(34, 1);
            }
            if (starcnt == 41) {
                gocnt = 2;
                gocntdrop = 16;
                playsnd(35, 1);
            }
            if (starcnt == 24) {
                gocnt = 1;
                gocntdrop = 16;
                playsnd(36, 1);
            }
            if (starcnt == 2) {
                gocnt = 0;
                gocntdrop = 16;
                playsnd(37, 1);
            }
            var duds = 0;
            if ((starcnt <= 63) && (starcnt > 52)) {
                duds = 1;
            }
            if ((starcnt <= 41) && (starcnt > 32)) {
                duds = 4;
            }
            if ((starcnt <= 24) && (starcnt > 13)) {
                duds = 2;
            }
            if (starcnt <= 2) {
                duds = 3;
            }
            if ((starcnt == 0) && (gocntdrop < 7)) {
                duds = 1;
            }
            rd.globalAlpha = 0.6;
            rd.drawImage(insano[duds], ((640 * mw) - (230 * avm)), (10 * mh), (274 * avm * 0.7), (341 * avm * 0.7));
            rd.globalAlpha = 1;
        }
        if (gocntdrop != 0) {
            if (gocnt != 0) {
                drawcs(100, "" + gocnt, 0, 0, 0, 3);
            } else {
                drawcs(100, "Go!", 0, 0, 0, 3);
            }
            gocntdrop--;
        }
        if (looped != 0) {
            if ((loop[0] == 2) && ((Math.abs(travxy[0]) > 110) || (Math.abs(travzy[0]) > 110))) {
                looped = 0;
            }
            if ((looped == 1) && (!mtouch[0])) {
                looped = 2;
            }
        }
        if (power[im] < 40) {
            if ((tcnt == 30) && (auscnt == 45) && (mtouch[im]) && (capcnt[im] == 0)) {
                if (looped != 3) {
                    if ((pwcnt < 70) || ((pwcnt < 100) && (looped != 0))) {
                        if (pwflk) {
                            drawcs(176, "Power low, perform stunt!", 0, 0, 200, 0);
                            pwflk = false;
                        } else {
                            drawcs(176, "Power low, perform stunt!", 255, 100, 0, 0);
                            pwflk = true;
                        }
                    }
                } else {
                    if (pwcnt < 100) {
                        if (pwflk) {
                            drawcs(176, "Try to flip your car in the air to preform stunts!", 0, 0, 200, 0);
                            pwflk = false;
                        } else {
                            drawcs(176, "Try to flip your car in the air to preform stunts!", 255, 100, 0, 0);
                            pwflk = true;
                        }
                    }
                }
                if (frgm >= m) {
                    pwcnt++;
                }
                if (pwcnt == 300) {
                    pwcnt = 0;
                    if (looped >= 2) {
                        looped++;
                        if (looped == 5) {
                            looped = 3;
                        }
                    }
                }
            }
        } else {
            if (pwcnt != 0) {
                pwcnt = 0;
            }
        }
        if (capcnt[im] == 0) {
            if (tcnt < 30) {
                if (tflk) {
                    drawcs(167, say, 0, 0, 0, 1);
                    tflk = false;
                } else {
                    if (!wasay) {
                        drawcs(167, say, 0, 128, 255, 1);
                    } else {
                        drawcs(167, say, 255, 128, 0, 1);
                    }
                    tflk = true;
                }
                if (frgm >= m) {
                    tcnt++;
                }
            } else {
                if (wasay) {
                    wasay = false;
                }
            }
            if (auscnt < 45) {
                if (aflk) {
                    drawcs(136, asay, 98, 176, 255, 0);
                    aflk = false;
                } else {
                    drawcs(136, asay, 0, 128, 255, 0);
                    aflk = true;
                }
                if (frgm >= m) {
                    auscnt++;
                }
            }
        } else {
            if (tflk) {
                drawcs(176, "Bad Landing!", 0, 0, 200, 1);
                tflk = false;
            } else {
                drawcs(176, "Bad Landing!", 255, 100, 0, 1);
                tflk = true;
            }
        }
        if ((trcnt[im] == 10) && (frgm >= m)) {
            loopin = "";
            spin = "";
            asay = "";
            var lp = 0;
            while (travzy[im] > 225) {
                travzy[im] -= 360;
                lp++;
            }
            while (travzy[im] < -225) {
                travzy[im] += 360;
                lp--;
            }
            if (lp == 1) {
                loopin = "Forward loop";
            }
            if (lp == 2) {
                loopin = "double Forward";
            }
            if (lp == 3) {
                loopin = "triple Forward";
            }
            if (lp >= 4) {
                loopin = "massive Forward looping";
            }
            if (lp == -1) {
                loopin = "Backloop";
            }
            if (lp == -2) {
                loopin = "double Back";
            }
            if (lp == -3) {
                loopin = "triple Back";
            }
            if (lp <= -4) {
                loopin = "massive Back looping";
            }
            if (lp == 0) {
                if ((ftab[im]) && (btab[im])) {
                    loopin = "Tabletop and reversed Tabletop";
                } else {
                    if (ftab[im] || btab[im]) {
                        loopin = "Tabletop";
                    }
                }
            }
            if ((lp > 0) && (btab[im])) {
                loopin = "Hanged " + loopin;
            }
            if ((lp < 0) && (ftab[im])) {
                loopin = "Hanged " + loopin;
            }
            if (loopin != "") {
                asay += " " + loopin;
            }
            lp = 0;
            travxy[im] = Math.abs(travxy[im]);
            while (travxy[im] > 270) {
                travxy[im] -= 360;
                lp++;
            }
            if ((lp == 0) && (rtab[im])) {
                if (loopin == "") {
                    spin = "Tabletop";
                } else {
                    spin = "Flipside";
                }
            }
            if (lp == 1) {
                spin = "Rollspin";
            }
            if (lp == 2) {
                spin = "double Rollspin";
            }
            if (lp == 3) {
                spin = "triple Rollspin";
            }
            if (lp >= 4) {
                spin = "massive Roll spinning";
            }
            lp = 0;
            var beyond = false;
            travxz[im] = Math.abs(travxz[im]);
            while (travxz[im] > 90) {
                travxz[im] -= 180;
                lp += 180;
                if (lp > 900) {
                    lp = 900;
                    beyond = true;
                }
            }
            if (lp != 0) {
                if ((loopin == "") && (spin == "")) {
                    asay += " " + lp;
                    if (beyond) {
                        asay += " and beyond";
                    }
                } else {
                    if (spin != "") {
                        if (loopin == "") {
                            asay += " " + spin;
                        } else {
                            asay += " with " + spin;
                        }
                    }
                    asay += " by " + lp;
                    if (beyond) {
                        asay += " and beyond";
                    }
                }
            } else {
                if (spin != "") {
                    if (loopin == "") {
                        asay += " " + spin;
                    } else {
                        asay += " by " + spin;
                    }
                }
            }
            if (asay != "") {
                auscnt -= 15;
            }
            if (loopin != "") {
                auscnt -= 25;
            }
            if (spin != "") {
                auscnt -= 25;
            }
            if (lp != 0) {
                auscnt -= 25;
            }
            if (auscnt < 45) {
                playsnd(27, 1);
                if (onautocorrect) {
                    onautocorrect--;
                }
                if (auscnt < -20) {
                    auscnt = -20;
                }
                var prp = 0;
                if (powerup[im] > 20) {
                    prp = 1;
                }
                if (powerup[im] > 40) {
                    prp = 2;
                }
                if (powerup[im] > 150) {
                    prp = 3;
                }
                if (surfer[im]) {
                    asay = " " + adj[4][Math.floor(Math.random() * 2.99)] + asay;
                }
                if (prp != 3) {
                    asay = adj[prp][Math.floor(Math.random() * 2.99)] + asay + exlm[prp];
                } else {
                    asay = adj[prp][Math.floor(Math.random() * 2.99)];
                }
                if (!wasay) {
                    tcnt = auscnt;
                    if (power[im] != 98) {
                        say = "POWER UP " + Math.floor(100 * powerup[im] / 98) + "%";
                    } else {
                        say = "POWER TO THE MAX";
                    }
                }
            }
        }
        if (car[0].fcnt == 2) {
            if (!wasay) {
                say = "Car Fixed";
                tcnt = 0;
            }
        }
        if (ncars != 1) {
            for (var i = 0; i < ncars; i++) {
                if ((dested[i] != cp.dested[i]) && (i != im)) {
                    dested[i] = cp.dested[i];
                    if (dested[i] == 1) {
                        wasay = true;
                        say = "" + cd.names[sel[i]] + " has been wasted!";
                        tcnt = -15;
                    }
                    if (dested[i] == 2) {
                        wasay = true;
                        say = "You wasted " + cd.names[sel[i]] + "!";
                        tcnt = -15;
                    }
                }
            }
        }
        if ((iclear != clear[im]) && (clear[im] != 0)) {
            if (!wasay) {
                say = "Check Point";
                tcnt = 15;
            }
            iclear = clear[im];
            playsnd(28, 1);
            cntovn = 0;
            if (cntan != 0) {
                cntan = 0;
            }
        }
    }
}
var shownbordo = 0;
function drawonbordo() {
    var fm = mw;
    if ((mw / mh) > 1.2) {
        fm *= (1.2 / (mw / mh));
    }
    var topo = ((260 * mh));
    if (pwflk) {
        pwflk = false;
    } else {
        pwflk = true;
    }
    if (starcnt > 130) {
        if (pwflk) {
            ondud = Math.floor(Math.random() * 6);
            if (ondud == 6) {
                ondud = 5;
            }
        }
    } else {
        ondud = 2;
    }
    rd.drawImage(insano[ondud], (10 * fm), topo, (274 * fm * 0.7), (341 * fm * 0.7));
    rd.fillStyle = "#FFFFFF";
    rd.globalAlpha = 0.7;
    var fldn = 250;
    if (cp.stage == 4) {
        fldn = 280;
    }
    floatytalk((200 * fm), topo, (1060 * fm), (fldn * fm), (20 * fm));
    rd.globalAlpha = 1;
    rd.letterSpacing = "0px";
    rd.font = "" + (30 * fm) + "px verd";
    rd.textBaseline = "middle";
    rd.textAlign = "left";
    rd.fillStyle = "#002748";
    if (cp.stage == 2) {
        rd.fillText("Preform stunts to power up your car!", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
    }
    if (cp.stage == 4) {
        rd.fillText("It is easier to just waste the other cars in this stage!", ((200 * fm) + (20 * fm)), (topo + (36 * fm)));
    }
    if (cp.stage == 2) {
        rd.font = "" + (50 * fm) + "px verd";
        rd.fillText("=", (770 * fm), (topo + (80 * fm) + (55 * avm)));
        rd.drawImage(inst[4], ((200 * fm) + (90 * fm)), (topo + (70 * fm)), (464 * fm), (150 * fm));
        rd.letterSpacing = "1px";
        rd.font = "" + (11 * (mh + mw)) + "px junk";
        rd.textAlign = "right";
        rd.fillStyle = "#000000";
        rd.fillText("Power", ((945 * fm) - (15 * avm)), (topo + (80 * fm) + (55 * avm)));
        var r = 128;
        var g = (190 + (70 * 0.37));
        var b = 255;
        drawbar((945 * fm), (topo + (80 * fm) + (42 * avm)), "#00B0DC", "#005C96", "rgb(" + r + "," + g + "," + b + ")", (70 / 98));
    }
    if (cp.stage == 4) {
        rd.drawImage(inst[1], ((200 * fm) + (70 * fm) + (200 * fm)), (topo + (60 * fm)), (485 * fm), (206 * fm));
    }
}
function afteradend() {
    if (htyp) {
        cntreps = 0;
        adv = Math.floor(90 * Math.random());
        vxz = Math.floor(360 * Math.random());
        hrewindhreplay();
        requestAnimationFrame(render);
    } else {
        iniend();
        fase = 12;
    }
    resumestagetrack();
}
function drawreplay() {
    rd.clearRect(0, 0, canw, canh);
    rd.letterSpacing = "1px";
    rd.font = "" + (20 * (mh + mw)) + "px junk";
    rd.textAlign = "left";
    rd.textBaseline = "middle";
    rd.fillStyle = "rgb(0,32,64)";
    rd.fillText("REPLAY", (20 * mw), (35 * mh));
    if (drawbutton(1, (canw - (100 * avm) - (30 * mw)), (canh - (60 * avm) - (30 * mh)), 170, 60, "#019DFF", "#01EAFF", "#004A78", "#016D77", 0, "Exit ", 20, 0.7, btimg[1], 0.7, false)) {
        onbreplay = 2;
    }
    if (enter == 1) {
        onbreplay = 2;
        enter = 2;
    }
    if (onbreplay == 1) {
        fastforwardexit();
    }
    if (fr > 425) {
        rd.fillStyle = "#000000";
        rd.fillRect(0, 0, canw, canh);
    }
    if (onbreplay) {
        rd.globalAlpha = 0.7;
        rd.fillStyle = "#000000";
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
        onbreplay--;
    }
}
var cntreps = 0;
var rmode = 0;
var holdf = 0;
var lwit = false;
var onpausefr = false;
function drawhreplay() {
    rd.clearRect(0, 0, canw, canh);
    rd.letterSpacing = "1px";
    rd.font = "" + (24 * (mh + mw)) + "px junk";
    rd.textAlign = "center";
    rd.textBaseline = "middle";
    var grd = rd.createLinearGradient((640 * mw), ((40 * mh) - (10 * avm)), (640 * mw), ((40 * mh) + (10 * avm)));
    grd.addColorStop(0, "#006ED4");
    grd.addColorStop(1, "#A3E6FF");
    rd.fillStyle = grd;
    rd.fillText("Game Highlight", (640 * mw), (40 * mh));
    rd.strokeStyle = "#003E78";
    rd.lineWidth = (1.5 * avm);
    rd.strokeText("Game Highlight", (640 * mw), (40 * mh));
    if (htyp == 1) {
        if (cp.stage > 2) {
            drawcs(90, "Stunts!", 0, 32, 64, 1);
        } else {
            drawcs(90, "Best Stunt!", 0, 32, 64, 1);
        }
        if (rmode == 98) {
            if (holdf == 4 || holdf == 7 || holdf == 44 || holdf == 47 || holdf == 94 || holdf == 97) {
                rd.globalAlpha = 0.5;
                rd.fillStyle = "#FFFFFF";
                rd.fillRect(0, 0, canw, canh);
                rd.globalAlpha = 1;
            }
        }
        if (rmode == 43) {
            if ((holdf >= 1) && (holdf < 43)) {
                if ((holdf % Math.floor(2 + (Math.random() * 3)) == 0) && (!lwit)) {
                    rd.globalAlpha = 0.5;
                    rd.fillStyle = "#FFFFFF";
                    rd.fillRect(0, 0, canw, canh);
                    rd.globalAlpha = 1;
                    lwit = true;
                } else {
                    lwit = false;
                }
            }
        }
        if ((fr > hat) && (holdf != rmode)) {
            holdf++;
        }
        camode = 1;
        cim = 0;
        onpausefr = false;
        if (holdf == 0 || holdf == rmode) {
            fr++;
            if (fr == 430) {
                fr = 0;
                holdf = 0;
                hrewindhreplay();
                cntreps++;
            }
        } else {
            onpausefr = true;
        }
    }
    if (htyp == 2) {
        drawcs(90, "Wasted!", 0, 32, 64, 1);
        if (rmode == 95) {
            if (holdf == 4 || holdf == 44 || holdf == 94) {
                rd.globalAlpha = 0.5;
                rd.fillStyle = "#FFFFFF";
                rd.fillRect(0, 0, canw, canh);
                rd.globalAlpha = 1;
            }
        }
        if ((fr > hat) && (holdf != rmode)) {
            holdf++;
        }
        camode = 1;
        cim = 0;
        onpausefr = false;
        if (holdf == 0 || holdf == rmode) {
            fr++;
            if (fr == 430) {
                fr = 0;
                holdf = 0;
                hrewindhreplay();
                cntreps++;
            }
        } else {
            onpausefr = true;
        }
    }
    if (htyp == 3) {
        drawcs(90, "You Wasted'em!", 0, 32, 64, 1);
        if (holdf == 13 || holdf == 16) {
            rd.globalAlpha = 0.5;
            rd.fillStyle = "#FFFFFF";
            rd.fillRect(0, 0, canw, canh);
            rd.globalAlpha = 1;
        }
        if (holdf == 0) {
            camode = 1;
            cim = 0;
        }
        if ((holdf > 0) && (holdf < 30)) {
            camode = 3;
            cim = 0;
            cim2 = hscar;
            htrns = holdf;
        }
        if (holdf == 30) {
            camode = 1;
            cim = hscar;
        }
        if ((fr > hat) && (holdf != 30)) {
            holdf++;
        }
        onpausefr = false;
        if (holdf == 0 || holdf == 30) {
            fr++;
            if (fr == 430) {
                fr = 0;
                holdf = 0;
                hrewindhreplay();
                cntreps++;
            }
        } else {
            onpausefr = true;
        }
    }
    if (htyp == 4) {
        drawcs(90, "Close Finish!", 0, 32, 64, 1);
        if (holdf == 0) {
            camode = 1;
            cim = 0;
        }
        if ((holdf > 0) && (holdf < 30)) {
            camode = 3;
            cim = 0;
            cim2 = hscar;
            htrns = holdf;
        }
        if (holdf == 30) {
            camode = 1;
            cim = hscar;
        }
        if ((holdf > 30) && (holdf < 60)) {
            camode = 3;
            cim = hscar;
            cim2 = 0;
            htrns = (holdf - 30);
        }
        if (holdf == 60) {
            camode = 1;
            cim = 0;
        }
        if ((holdf > 60) && (holdf < 90)) {
            camode = 3;
            cim = 0;
            cim2 = hscar;
            htrns = (holdf - 60);
        }
        if (holdf == 90) {
            camode = 1;
            cim = hscar;
        }
        if ((fr > 228) && (holdf < 30)) {
            holdf++;
        }
        if ((fr > 328) && (holdf < 60)) {
            holdf++;
        }
        if ((fr > 400) && (holdf < 90)) {
            holdf++;
        }
        onpausefr = false;
        if (holdf == 0 || holdf == 30 || holdf == 60 || holdf == 90) {
            fr++;
            if (fr == 430) {
                fr = 0;
                holdf = 0;
                hrewindhreplay();
                cntreps++;
            }
        } else {
            onpausefr = true;
        }
    }
    if (htyp == 5) {
        drawcs(90, "Close Finish!  Almost got it!", 0, 32, 64, 1);
        if (holdf == 0) {
            camode = 1;
            cim = 0;
        }
        if ((holdf > 0) && (holdf < 30)) {
            camode = 3;
            cim = 0;
            cim2 = hscar;
            htrns = holdf;
        }
        if (holdf == 30) {
            camode = 1;
            cim = hscar;
        }
        if ((holdf > 30) && (holdf < 60)) {
            camode = 3;
            cim = hscar;
            cim2 = 0;
            htrns = (holdf - 30);
        }
        if (holdf == 60) {
            camode = 1;
            cim = 0;
        }
        if ((holdf > 60) && (holdf < 90)) {
            camode = 3;
            cim = 0;
            cim2 = hscar;
            htrns = (holdf - 60);
        }
        if (holdf == 90) {
            camode = 1;
            cim = hscar;
        }
        if ((holdf > 90) && (holdf < 120)) {
            camode = 3;
            cim = hscar;
            cim2 = 0;
            htrns = (holdf - 90);
        }
        if (holdf == 120) {
            camode = 1;
            cim = 0;
        }
        if ((fr > 128) && (holdf < 30)) {
            holdf++;
        }
        if ((fr > 228) && (holdf < 60)) {
            holdf++;
        }
        if ((fr > 328) && (holdf < 90)) {
            holdf++;
        }
        if ((fr > 400) && (holdf < 120)) {
            holdf++;
        }
        onpausefr = false;
        if (holdf == 0 || holdf == 30 || holdf == 60 || holdf == 90 || holdf == 120) {
            fr++;
            if (fr == 430) {
                fr = 0;
                holdf = 0;
                hrewindhreplay();
                cntreps++;
            }
        } else {
            onpausefr = true;
        }
    }
    if ((cntreps == 2) && (fr == 427)) {
        iniend();
        fase = 12;
    }
    if (enter == 1) {
        enter = 2;
        iniend();
        fase = 12;
    }
    if (drawbutton(1, (canw - (100 * avm) - (30 * mw)), (canh - (60 * avm) - (30 * mh)), 170, 60, "#019DFF", "#01BAFF", "#004A78", "#015777", 0, "Skip ", 20, 0.7, btimg[1], 0.7, false) || ((mdown) && (cp.stage == 1) && (unlocked == 1))) {
        iniend();
        fase = 12;
    }
    if (fr >= 428) {
        rd.globalAlpha = 0.7;
        rd.fillStyle = "#000000";
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
    }
}
var confr = 0;
var confl = -1;
var confg = 0;
var confc = 0;
var morgn = Math.random();
var unlcar = -1;
function iniend() {
    gameplayStop();
    fredo = 0;
    ondud = Math.floor(Math.random() * 6);
    if (ondud == 6) {
        ondud = 5;
    }
    morgn = Math.random();
    unlcar = -1;
    if ((winner) && (unlocked == cp.stage) && (ncars != 1)) {
        if (cp.stage == 2) {
            unlcar = 11;
        }
        if (cp.stage == 4) {
            unlcar = 12;
        }
        if (cp.stage == 6) {
            unlcar = 13;
        }
        if (cp.stage == 8) {
            unlcar = 14;
        }
        if (cp.stage == 10) {
            unlcar = 15;
        }
        if (cp.stage == 12) {
            unlcar = 16;
        }
        if (cp.stage == 14) {
            unlcar = 17;
        }
        if (cp.stage == 16) {
            unlcar = 18;
        }
        if (cp.stage == 17) {
            confc = 0;
            confg = 0;
            confr = 0;
            finishedGame();
        }
        if (unlcar != -1) {
            morgn = (0.4 * Math.random());
        }
    }
}
function endgame() {
    rd.clearRect(0, 0, canw, canh);
    if (fredo == 76) {
        rd.globalAlpha = 0.1;
    }
    rd.save();
    rd.rotate((-15 + (morgn * 25)) * (Math.PI / 180));
    rd.drawImage(insano[ondud], ((110 * morgn) - 60), (200 * mh), (274 * avm), (341 * avm));
    rd.letterSpacing = "1px";
    rd.font = "" + (40 * (mh + mw)) + "px junk";
    rd.textAlign = "left";
    rd.textBaseline = "middle";
    rd.strokeStyle = "#0A3C00";
    rd.lineWidth = (10 * avm);
    rd.strokeText("THIS. IS. MADNESS !", (((110 * morgn) - 60) + (274 * avm)), ((200 * mh) + (170 * avm)));
    rd.fillStyle = "#FEA700";
    rd.fillText("THIS. IS. MADNESS !", (((110 * morgn) - 60) + (274 * avm)), ((200 * mh) + (170 * avm)));
    rd.restore();
    rd.globalAlpha = 1;
    if (fredo != 76) {
        var r = Math.floor(128 - (128 * snap[0]));
        if (r > 255) {
            r = 255;
        }
        if (r < 0) {
            r = 0;
        }
        var g = Math.floor(128 - (128 * snap[1]));
        if (g > 255) {
            g = 255;
        }
        if (g < 0) {
            g = 0;
        }
        var b = Math.floor(128 - (128 * snap[2]));
        if (b > 255) {
            b = 255;
        }
        if (b < 0) {
            b = 0;
        }
        var hsl = rgbToHsl(r, g, b);
        var rgb = hslToRgb(hsl[0], 0.4, 0.1);
        rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        var alpb = (fredo / 50);
        if (alpb > 0.9) {
            alpb = 0.9;
        }
        rd.globalAlpha = alpb;
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
    }
    if (fredo >= 50) {
        var contxt = "Congradulations!";
        if (!winner) {
            contxt = "Game Over";
        }
        rd.letterSpacing = "1px";
        rd.font = "" + (30 * (mh + mw)) + "px junk";
        rd.textAlign = "center";
        rd.textBaseline = "middle";
        rd.strokeStyle = "#783800";
        rd.lineWidth = (10 * avm);
        rd.strokeText(contxt, (640 * mw), (100 * mh));
        var grd = rd.createLinearGradient((640 * mw), (70 * mh), (640 * mw), (130 * mh));
        grd.addColorStop(0, "#FF5B01");
        grd.addColorStop(1, "#FF9601");
        rd.fillStyle = grd;
        rd.fillText(contxt, (640 * mw), (100 * mh));
        rd.globalAlpha = 0.7;
        rd.letterSpacing = "1px";
        rd.font = "" + (18 * (mh + mw)) + "px junk";
        rd.fillStyle = "#FFA627";
        if (winner) {
            rd.fillText("You won at stage " + cp.stage + "", (640 * mw), (190 * mh));
        } else {
            rd.fillText("You lost at stage " + cp.stage + "", (640 * mw), (190 * mh));
        }
        rd.fillStyle = "#FF5B01";
        rd.fillText(cp.name, (640 * mw), (240 * mh));
        rd.globalAlpha = 1;
        if ((winner) && (unlocked == cp.stage) && (ncars != 1)) {
            rd.letterSpacing = "1px";
            rd.font = "" + (20 * (mh + mw)) + "px junk";
            rd.fillStyle = "#94CA00";
            if (aflk) {
                rd.fillStyle = "#BCFA00";
                aflk = false;
            } else {
                aflk = true;
            }
            if (cp.stage != 17) {
                var andcar = "";
                if (unlcar != -1) {
                    andcar = " and " + cd.names[unlcar] + "";
                }
                rd.fillText("Stage " + (cp.stage + 1) + "" + andcar + " is now unlocked!", (640 * mw), (340 * mh));
            } else {
                rd.fillText("Wooohooo you finished the game!", (640 * mw), (340 * mh));
                rd.fillText("You're Awesome! You're truly a MAD DRIVER!", (640 * mw), (410 * mh));
                if (confc < 20) {
                    if (confg == 0) {
                        if (Math.floor(confr) <= 28) {
                            rd.drawImage(confe[Math.floor(confr)], (confl * 170 * mw), 0, (1280 * mw), (720 * mh));
                            confr += 0.5;
                        } else {
                            confg = 30;
                            confr = 0;
                            if (confl == 1) {
                                confl = -1;
                            } else {
                                confl = 1;
                            }
                            confc++;
                        }
                    } else {
                        confg--;
                    }
                }
            }
        }
        if (ncars == 1) {
            rd.letterSpacing = "1px";
            rd.font = "" + (20 * (mh + mw)) + "px junk";
            rd.fillStyle = "#94CA00";
            rd.fillText("Practice game finished", (640 * mw), (340 * mh));
        }
        if (enter == 1) {
            stopstagetrack();
            oldafteradend();
            enter = 2;
        }
        if (drawbutton(7, (640 * mw), (canh - (60 * avm) - (40 * mh)), 250, 60, "#FF1301", "#FF8A01", "#780800", "#784100", 0, "Continue ", 20, 0.8, btimg[1], 0.8, false)) {
            stopstagetrack();
            oldafteradend();
        }
    } else {
        fredo++;
        if (fredo == 50) {
            for (var c = 0; c < ncars; c++) {
                fixcar(c);
            }
            if (unlcar != -1) {
                fredo = 76;
                colorbgstforend();
                updateframe = true;
                requestAnimationFrame(render);
                carmy = -20;
                carup = 0;
                carms = 100;
                sel[0] = unlcar;
            }
        }
    }
}
function oldafteradend() {
    if ((winner) && (unlocked == cp.stage) && (ncars != 1)) {
        if (cp.stage != 17) {
            unlocked++;
            cp.stage = unlocked;
            saveInfo("unlocked", unlocked);
        } else {
            cp.stage = Math.floor(3 + (Math.random() * 13));
        }
    }
    fredo = 0;
    onskip = true;
    fase = 1;
}
function drawcarselect() {
    rd.clearRect(0, 0, canw, canh);
    var lefy = ((canw - (1380 * mh)) / 2);
    var rigy = (lefy + (1380 * mh));
    if (lefy < 0) {
        lefy = 0;
        rigy = canw;
    }
    rd.letterSpacing = "1px";
    rd.font = "" + (16 * (mh + mw)) + "px junk";
    rd.textAlign = "left";
    rd.textBaseline = "middle";
    rd.strokeStyle = "#0C0959";
    rd.lineWidth = (10 * avm);
    rd.strokeText("Select your Car", (lefy + (20 * avm)), (25 * mh));
    rd.fillStyle = "#8665FF";
    rd.fillText("Select your Car", (lefy + (20 * avm)), (25 * mh));
    if (flyout == 0) {
        rd.letterSpacing = "1px";
        rd.font = "" + (20 * (mh + mw)) + "px junk";
        rd.textAlign = "center";
        rd.textBaseline = "middle";
        rd.strokeStyle = "#001A78";
        rd.lineWidth = (10 * avm);
        rd.strokeText(cd.names[sel[0]], (640 * mw), (120 * mh));
        rd.fillStyle = "#C1EEFF";
        rd.fillText(cd.names[sel[0]], (640 * mw), (120 * mh));
        if (u[0].right) {
            if (sel[0] != 18) {
                nextc = 1;
                flyout = 2;
            }
            u[0].right = false;
        }
        if (u[0].left) {
            if (sel[0] != 0) {
                nextc = -1;
                flyout = 2;
            }
            u[0].left = false;
        }
        if (sel[0] != 0) {
            if (drawbutton(1, (lefy + (120 * avm)), (430 * mh), 140, 47, "#4B00F6", "#CB81FF", "#0600F6", "#5700F6", 3, " Prev", 15, 0.9, btimg[3], 0.9, false)) {
                nextc = -1;
                flyout = 2;
            }
        }
        if (sel[0] != 18) {
            if (drawbutton(2, (rigy - (120 * avm)), (430 * mh), 140, 47, "#4B00F6", "#CB81FF", "#0600F6", "#5700F6", 0, "Next ", 15, 0.9, btimg[2], 0.9, false)) {
                nextc = 1;
                flyout = 2;
            }
        }
        var clocked = 0;
        if ((sel[0] >= 7) && (sel[0] <= 10)) {
            if (rewlocked[(sel[0] - 7)]) {
                clocked = -1;
            }
        }
        if ((sel[0] >= 11) && (unlocked <= ((sel[0] - 10) * 2))) {
            clocked = ((sel[0] - 10) * 2);
        }
        if (clocked <= 0) {
            rd.letterSpacing = "1px";
            rd.font = "" + (11 * (mh + mw)) + "px junk";
            rd.textAlign = "right";
            rd.textBaseline = "middle";
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (6 * avm);
            rd.strokeText("Top Speed", (lefy + (180 * avm)), (200 * mh));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("Top Speed", (lefy + (180 * avm)), (200 * mh));
            var perci = ((cd.swits[sel[0]][2] - 22) / 9);
            if (perci < 0.2) {
                perci = 0.2;
            }
            drawcoolrect((lefy + (300 * avm)), ((200 * mh) - (7 * avm)), 200, 20, "#FF1301", "#FFBA01", "#29C2F0", perci);
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (6 * avm);
            rd.strokeText("Acceleration", (lefy + (180 * avm)), ((200 * mh) + (40 * avm)));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("Acceleration", (lefy + (180 * avm)), ((200 * mh) + (40 * avm)));
            perci = ((cd.acelf[sel[0]][1] * cd.acelf[sel[0]][0] * cd.acelf[sel[0]][2] * cd.grip[sel[0]]) / 0.77);
            if (perci > 1) {
                perci = 1;
            }
            drawcoolrect((lefy + (300 * avm)), ((200 * mh) - (7 * avm) + (40 * avm)), 200, 20, "#FF1301", "#FFBA01", "#29C2F0", perci);
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (6 * avm);
            rd.strokeText("Handling", (lefy + (180 * avm)), ((200 * mh) + (80 * avm)));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("Handling", (lefy + (180 * avm)), ((200 * mh) + (80 * avm)));
            perci = cd.dishandle[sel[0]];
            drawcoolrect((lefy + (300 * avm)), ((200 * mh) - (7 * avm) + (80 * avm)), 200, 20, "#FF1301", "#FFBA01", "#29C2F0", perci);
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (6 * avm);
            rd.strokeText("Stunts", (rigy - (290 * avm)), (200 * mh));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("Stunts", (rigy - (290 * avm)), (200 * mh));
            perci = (((cd.airc[sel[0]] * 10 * cd.airs[sel[0]] * cd.bounce[sel[0]]) + 28) / 139);
            if (perci > 1) {
                perci = 1;
            }
            drawcoolrect((rigy - (170 * avm)), ((200 * mh) - (7 * avm)), 200, 20, "#FF1301", "#FFBA01", "#29C2F0", perci);
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (6 * avm);
            rd.strokeText("Strength", (rigy - (290 * avm)), ((200 * mh) + (40 * avm)));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("Strength", (rigy - (290 * avm)), ((200 * mh) + (40 * avm)));
            perci = ((cd.moment[sel[0]] + 0.5) / 2.6);
            if (perci > 1) {
                perci = 1;
            }
            drawcoolrect((rigy - (170 * avm)), ((200 * mh) - (7 * avm) + (40 * avm)), 200, 20, "#FF1301", "#FFBA01", "#29C2F0", perci);
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (6 * avm);
            rd.strokeText("Endurance", (rigy - (290 * avm)), ((200 * mh) + (80 * avm)));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("Endurance", (rigy - (290 * avm)), ((200 * mh) + (80 * avm)));
            perci = cd.outdam[sel[0]];
            drawcoolrect((rigy - (170 * avm)), ((200 * mh) - (7 * avm) + (80 * avm)), 200, 20, "#FF1301", "#FFBA01", "#29C2F0", perci);
        } else {
            rd.letterSpacing = "1px";
            rd.font = "" + (17 * (mh + mw)) + "px junk";
            rd.textAlign = "center";
            rd.textBaseline = "middle";
            rd.strokeStyle = "#00284A";
            rd.lineWidth = (10 * avm);
            rd.strokeText("This car unlocks when  stage " + clocked + "  is completed!", (640 * mw), (200 * mh));
            rd.fillStyle = "#A3D5FF";
            rd.fillText("This car unlocks when  stage " + clocked + "  is completed!", (640 * mw), (200 * mh));
        }
        if (clocked) {
            var xp = [((640 * mw) - (300 * mh) - (3 * mh)), ((640 * mw) - (300 * mh) - (3 * mh)), ((640 * mw) - (120 * mh) - (3 * mh)), ((640 * mw) - (120 * mh) - (3 * mh))];
            var yp = [(564 * mh), ((560 * mh) + (108 * mh)), ((600 * mh) + (108 * mh)), (604 * mh)];
            rd.fillStyle = "#21AEFF";
            rd.globalAlpha = 0.5;
            fillPolygon(xp, yp, 4);
            rd.globalAlpha = 1;
            rd.strokeStyle = "#002748";
            rd.lineWidth = (2 * mh);
            drawPolygon(xp, yp, 4);
            var xp = [((640 * mw) + (120 * mh) - (3 * mh)), ((640 * mw) + (120 * mh) - (3 * mh)), ((640 * mw) - (120 * mh) - (3 * mh)), ((640 * mw) - (120 * mh) - (3 * mh))];
            var yp = [(604 * mh), ((600 * mh) + (108 * mh)), ((600 * mh) + (108 * mh)), (604 * mh)];
            rd.fillStyle = "#21AEFF";
            rd.globalAlpha = 0.5;
            fillPolygon(xp, yp, 4);
            rd.globalAlpha = 1;
            rd.strokeStyle = "#002748";
            rd.lineWidth = (2 * mh);
            drawPolygon(xp, yp, 4);
            var xp = [((640 * mw) + (300 * mh) - (3 * mh)), ((640 * mw) + (300 * mh) - (3 * mh)), ((640 * mw) + (120 * mh) - (3 * mh)), ((640 * mw) + (120 * mh) - (3 * mh))];
            var yp = [(564 * mh), ((560 * mh) + (108 * mh)), ((600 * mh) + (108 * mh)), (604 * mh)];
            rd.fillStyle = "#21AEFF";
            rd.globalAlpha = 0.5;
            fillPolygon(xp, yp, 4);
            rd.globalAlpha = 1;
            rd.strokeStyle = "#002748";
            rd.lineWidth = (2 * mh);
            drawPolygon(xp, yp, 4);
            rd.drawImage(lbar, ((640 * mw) - (300 * mh) - (3 * mh)), (560 * mh), (6 * mh), (111 * mh));
            rd.drawImage(lbar, ((640 * mw) - (120 * mh) - (3 * mh)), (600 * mh), (6 * mh), (111 * mh));
            rd.drawImage(rbar, ((640 * mw) + (120 * mh) - (3 * mh)), (600 * mh), (6 * mh), (111 * mh));
            rd.drawImage(rbar, ((640 * mw) + (300 * mh) - (3 * mh)), (560 * mh), (6 * mh), (111 * mh));
            if (clocked == -1) {
                rd.drawImage(rewd, ((640 * mw) - (43.5 * mh)), (627 * mh), (87 * mh), (56 * mh));
            } else {
                rd.drawImage(lckd, ((640 * mw) - (29 * mh)), (619 * mh), (58 * mh), (72 * mh));
            }
        }
        if (clocked <= 0) {
            if (clocked != -1) {
                if (drawbutton(3, (rigy - (150 * avm)), ((720 * mh) - (100 * avm)), 200, 70, "#0057E6", "#65EFFF", "#440078", "#2F00A8", 0, "PLAY ", 25, 0.9, btimg[1], 0.9, true)) {
                    saveInfo("carsel", sel[0]);
                    stageloadtyp = 0;
                    stageload = -1;
                    fase = 3;
                }
                if (enter == 1) {
                    saveInfo("carsel", sel[0]);
                    stageloadtyp = 0;
                    stageload = -1;
                    fase = 3;
                    enter = 2;
                }
            } else {
                if (drawbutton(3, (rigy - (165 * avm)), ((720 * mh) - (100 * avm)), 230, 70, "#0057E6", "#65EFFF", "#440078", "#2F00A8", 0, "PLAY ", 25, 0.9, btimg[4], 0.9, true)) {
                    pauseintertrack();
                    RewardCar();
                }
                if (enter == 1) {
                    pauseintertrack();
                    RewardCar();
                    enter = 2;
                }
            }
        }
    }
    if (!flwg) {
        flw -= 0.03;
        if (flw < 0.5) {
            flw = 0.5;
            flwg = true;
        }
    } else {
        flw += 0.03;
        if (flw > 2) {
            flw = 2;
            flwg = false;
        }
    }
    if (!flhg) {
        flh -= 0.5;
        if (flh < 0.1) {
            flh = 0.1;
            flhg = true;
        }
    } else {
        flh += 0.5;
        if (flh > 2) {
            flh = 2;
            flhg = false;
        }
    }
    musictog();
}
function unlockrewcar() {
    playintertrack();
    rewlocked[(sel[0] - 7)] = 0;
    saveInfo("rewlocked" + (sel[0] - 7) + "", rewlocked[(sel[0] - 7)]);
    saveInfo("carsel", sel[0]);
    stageloadtyp = 0;
    stageload = -1;
    fase = 3;
}
function failedrewcar() {
    playintertrack();
    fase = 2;
    requestAnimationFrame(render);
}
var alipha = 0;
var bgsload = null;
var stageloadtyp = 0;
function stageloading() {
    rd.clearRect(0, 0, canw, canh);
    if ((stageload == 0) && (updateframe || stageloadtyp == 2)) {
        stageload = 0;
        loadstage();
        if (!engload[sel[0]]) {
            loadeng(sel[0]);
        }
    }
    if (stageload == -1) {
        alipha = 0.2;
        stageload = 0;
    }
    if (stageloadtyp == 0) {
        rd.globalAlpha = alipha;
        rd.fillStyle = "#9FD3FF";
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
        alipha += 0.02;
        if (alipha > 0.4) {
            alipha = 0.4;
        }
        rd.letterSpacing = "1px";
        rd.font = "" + (20 * (mh + mw)) + "px junk";
        rd.textAlign = "center";
        rd.textBaseline = "middle";
        rd.strokeStyle = "#2D9FFF";
        rd.lineWidth = (10 * avm);
        rd.strokeText("Loading Stage " + cp.stage + "", (640 * mw), (330 * mh));
        rd.fillStyle = "#C1E3FF";
        rd.fillText("Loading Stage " + cp.stage + "", (640 * mw), (330 * mh));
    }
    if (stageloadtyp == 1) {
        rd.drawImage(bgsload, 0, 0);
    }
    if (stageloadtyp == 2) {
        rd.fillStyle = "#15190D";
        rd.fillRect(0, 0, canw, canh);
        rd.font = "18px junk";
        rd.letterSpacing = "1px";
        rd.fillStyle = "#6DCA00";
        rd.font = "" + (30 * avm) + "px junk";
        rd.textBaseline = "middle";
        rd.letterSpacing = "1px";
        rd.textAlign = "center";
        rd.fillText("Loading stage 1", (640 * mw), (250 * mh));
    }
    if (stageload == 2) {
        if (stageloadtyp != 2) {
            flkun = 0;
            flkpl = 0;
            hit = 4500;
            colorbgst();
            createbordo();
            ontip = false;
            if (hastip) {
                dudo = 0;
                ondud = 0;
            }
            fase = 4;
            requestAnimationFrame(render);
        } else {
            gotGamepads();
            requestAnimationFrame(render);
            gameplayStart();
            pauseintertrack();
            playtrack();
            fase = 7;
        }
    }
}
var ontip = false;
var xsp = [];
var ysp = [];
var flkun = 0;
var flkpl = 0;
function drawstageselect() {
    rd.clearRect(0, 0, canw, canh);
    if ((flkun) && (!ontip)) {
        rd.globalAlpha = 0.5;
        rd.fillStyle = "#9FD3FF";
        rd.fillRect(0, 0, canw, canh);
        rd.globalAlpha = 1;
        if (stageload != -1) {
            rd.letterSpacing = "1px";
            rd.font = "" + (22 * (mh + mw)) + "px junk";
            rd.textAlign = "center";
            rd.textBaseline = "middle";
            rd.fillStyle = "#00284A";
            rd.fillText("Stage Locked", (640 * mw), (380 * mh));
            if (aflk || flkun > 10) {
                rd.drawImage(lckd, ((640 * mw) - (29 * mh)), (250 * mh), (58 * mh), (72 * mh));
            }
            if (aflk) {
                aflk = false;
            } else {
                aflk = true;
            }
            flkun++;
            if (flkun == 30) {
                flkun = 0;
                aflk = false;
            }
        } else {
            rd.letterSpacing = "1px";
            rd.font = "" + (22 * (mh + mw)) + "px junk";
            rd.textAlign = "center";
            rd.textBaseline = "middle";
            rd.fillStyle = "#00284A";
            rd.fillText("Loading Stage " + cp.stage + "", (640 * mw), (330 * mh));
        }
    }
    if (!ontip) {
        if ((hastip) && (!flkun)) {
            if (aflk) {
                aflk = false;
            } else {
                aflk = true;
            }
            if (dudo > 50) {
                if (aflk) {
                    ondud = Math.floor(Math.random() * 6);
                    if (ondud == 6) {
                        ondud = 5;
                    }
                }
            }
            dudo++;
            if (dudo >= 67) {
                dudo = 0;
            }
            rd.globalAlpha = 0.6;
            rd.drawImage(insano[ondud], (70 * mw), ((720 * mh) - (222 * avm)), (274 * avm * 0.8), (341 * avm * 0.8));
            rd.globalAlpha = 1;
            rd.globalAlpha = 0.5;
            rd.fillStyle = "#FFFFFF";
            floatythink(((70 * mw) + (207 * avm)), ((720 * mh) - (115 * avm)), (30 * avm), (30 * avm), (10 * avm));
            floatythink(((70 * mw) + (247 * avm)), ((720 * mh) - (170 * avm)), (225 * avm), (90 * avm), (20 * avm));
            rd.globalAlpha = 1;
        }
    }
    var r = Math.floor(128 - (128 * snap[0]));
    if (r > 255) {
        r = 255;
    }
    if (r < 0) {
        r = 0;
    }
    var g = Math.floor(128 - (128 * snap[1]));
    if (g > 255) {
        g = 255;
    }
    if (g < 0) {
        g = 0;
    }
    var b = Math.floor(128 - (128 * snap[2]));
    if (b > 255) {
        b = 255;
    }
    if (b < 0) {
        b = 0;
    }
    var hsl = rgbToHsl(r, g, b);
    var rgb = hslToRgb(hsl[0], 1, 0.3);
    rd.strokeStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    rd.lineWidth = (10 * avm);
    spdPolygon(xsp, ysp, 50);
    rgb = hslToRgb(hsl[0], 1, 0.4);
    rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    spPolygon(0, 0, xsp, ysp, 0, 17, 1280, 0);
    spPolygon(1280, 0, xsp, ysp, 16, 26, 1280, 720);
    spPolygon(1280, 720, xsp, ysp, 25, 42, 0, 720);
    spPolygon(0, 720, xsp, ysp, 41, 51, 0, 0);
    if (!flkun) {
        rd.letterSpacing = "1px";
        rd.font = "" + (20 * (mh + mw)) + "px junk";
        rd.textAlign = "center";
        rd.textBaseline = "middle";
        rgb = hslToRgb(hsl[0], 1, 0.3);
        rd.strokeStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        rd.lineWidth = (10 * avm);
        rd.strokeText(cp.name, (640 * mw), (200 * mh));
        rgb = hslToRgb(hsl[0] + 0.05, 1, 0.9);
        rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        rd.fillText(cp.name, (640 * mw), (200 * mh));
        if ((cp.stage == 16) && (!ontip)) {
            rd.letterSpacing = "0px";
            rd.font = "" + (12 * (mh + mw)) + "px verd";
            rd.textBaseline = "middle";
            rd.textAlign = "center";
            rgb = hslToRgb(hsl[0], 1, 0.3);
            rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
            rd.fillText("( Guidance arrow is disabled in this stage... )", (640 * mw), (260 * mh));
        }
        rd.letterSpacing = "1px";
        rd.font = "" + (22 * (mh + mw)) + "px junk";
        rd.textAlign = "center";
        rd.textBaseline = "middle";
        rd.lineWidth = (10 * avm);
        if (cp.stage != 17) {
            rd.strokeText("Stage " + cp.stage, (640 * mw), (120 * mh));
        } else {
            rd.strokeText("Final Stage", (640 * mw), (120 * mh));
        }
        rgb = hslToRgb(hsl[0] - 0.05, 1, 0.6);
        rd.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        if (cp.stage != 17) {
            rd.fillText("Stage " + cp.stage, (640 * mw), (120 * mh));
        } else {
            rd.fillText("Final Stage", (640 * mw), (120 * mh));
            loadconfe();
        }
        if (!ontip) {
            rgb = hslToRgb((hsl[0] - 0.05), 1, 0.5);
            var rgb2 = hslToRgb((hsl[0] + 0.05), 1, 0.6);
            var rgb3 = hslToRgb((hsl[0] - 0.05), 1, 0.2);
            var rgb4 = hslToRgb((hsl[0] + 0.05), 1, 0.2);
            if (u[0].right) {
                if (cp.stage < 17) {
                    if (cp.stage != unlocked) {
                        cp.stage++;
                        stageload = -1;
                        flkun = 1;
                    } else {
                        flkun = 1;
                    }
                }
                u[0].right = false;
            }
            if (u[0].left) {
                if (cp.stage > 1) {
                    cp.stage--;
                    stageload = -1;
                    flkun = 1;
                }
                u[0].left = false;
            }
            if (cp.stage > 1) {
                if (drawbutton(3, (190 * avm), (360 * mh), 140, 47, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 3, " Prev", 15, 0.9, btimg[3], 0.9, false)) {
                    cp.stage--;
                    stageload = -1;
                    flkun = 1;
                }
            }
            if (cp.stage < 17) {
                if (drawbutton(2, (canw - (190 * avm)), (360 * mh), 140, 47, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 0, "Next ", 15, 0.9, btimg[2], 0.9, false)) {
                    if (cp.stage != unlocked) {
                        cp.stage++;
                        stageload = -1;
                        flkun = 1;
                    } else {
                        flkun = 1;
                    }
                }
            }
            if (!flkun) {
                if (hastip) {
                    if (tiplocked != cp.stage) {
                        if (drawbutton(6, ((70 * mw) + (357 * avm)), ((720 * mh) - (157 * avm)), 160, 60, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 0, "TIP ", 20, 0.9, btimg[4], 0.9, false)) {
                            pauseintertrack();
                            RewardTip();
                        }
                    } else {
                        if (drawbutton(6, ((70 * mw) + (357 * avm)), ((720 * mh) - (157 * avm)), 120, 60, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 1, "TIP ", 22, 0.9, null, 0, false)) {
                            ontip = true;
                            dudo = 0;
                        }
                    }
                } else {
                    if (cp.stage == 1 || cp.stage == 2) {
                        if (drawbutton(8, (canw - (510 * avm)), ((720 * mh) - (180 * avm)), 220, 60, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 1, "Practice ", 22, 0.9, null, 0, false)) {
                            setworld(snap, fogc, lvx, lvy, lvz, fogdist);
                            gameplayStart();
                            pauseintertrack();
                            playtrack();
                            ncars = 1;
                            fase = 7;
                        }
                    }
                }
            }
            if (flkpl > 30) {
                r = Math.floor(128 + (128 * snap[0]));
                if (r > 255) {
                    r = 255;
                }
                if (r < 0) {
                    r = 0;
                }
                g = Math.floor(128 + (128 * snap[1]));
                if (g > 255) {
                    g = 255;
                }
                if (g < 0) {
                    g = 0;
                }
                b = Math.floor(128 + (128 * snap[2]));
                if (b > 255) {
                    b = 255;
                }
                if (b < 0) {
                    b = 0;
                }
                hsl = rgbToHsl(r, g, b);
            }
            flkpl++;
            if (flkpl == 40) {
                flkpl = 0;
            }
            rgb = hslToRgb((hsl[0] - 0.05), 1, 0.5);
            rgb2 = hslToRgb((hsl[0] + 0.05), 1, 0.6);
            rgb3 = hslToRgb((hsl[0] - 0.05), 1, 0.2);
            rgb4 = hslToRgb((hsl[0] + 0.05), 1, 0.2);
            if (drawbutton(1, (canw - (220 * avm)), ((720 * mh) - (190 * avm)), 200, 70, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 0, "PLAY ", 25, 0.9, btimg[1], 0.9, true)) {
                setworld(snap, fogc, lvx, lvy, lvz, fogdist);
                gameplayStart();
                pauseintertrack();
                playtrack();
                fase = 7;
            }
            if (enter == 1) {
                setworld(snap, fogc, lvx, lvy, lvz, fogdist);
                gameplayStart();
                pauseintertrack();
                playtrack();
                fase = 7;
                enter = 2;
            }
            if (!flwg) {
                flw -= 0.03;
                if (flw < 0.5) {
                    flw = 0.5;
                    flwg = true;
                }
            } else {
                flw += 0.03;
                if (flw > 2) {
                    flw = 2;
                    flwg = false;
                }
            }
            if (!flhg) {
                flh -= 0.5;
                if (flh < 0.1) {
                    flh = 0.1;
                    flhg = true;
                }
            } else {
                flh += 0.5;
                if (flh > 2) {
                    flh = 2;
                    flhg = false;
                }
            }
        } else {
            var fm = mw;
            if ((mw / mh) > 1.2) {
                fm *= (1.2 / (mw / mh));
            }
            var topo = (260 * mh);
            if (aflk) {
                aflk = false;
            } else {
                aflk = true;
            }
            if (dudo < 200) {
                if (aflk) {
                    ondud = Math.floor(Math.random() * 6);
                    if (ondud == 6) {
                        ondud = 5;
                    }
                }
                dudo++;
            } else {
                ondud = 2;
            }
            rd.drawImage(insano[ondud], (10 * fm), topo, (274 * fm * 0.7), (341 * fm * 0.7));
            rd.fillStyle = "#FFFFFF";
            rd.globalAlpha = 0.6;
            floatytalk((200 * fm), topo, (990 * fm), (300 * fm), (20 * fm));
            rd.globalAlpha = 1;
            rd.letterSpacing = "0px";
            rd.font = "" + (30 * fm) + "px verd";
            rd.textBaseline = "middle";
            rd.textAlign = "left";
            rd.fillStyle = "#002748";
            for (var i = 0; i < hastip; i++) {
                rd.fillText(tip[i], ((200 * fm) + (20 * fm)), (topo + ((36 + (50 * i)) * fm)));
            }
            rgb = hslToRgb((hsl[0] - 0.05), 1, 0.5);
            var rgb2 = hslToRgb((hsl[0] + 0.05), 1, 0.6);
            var rgb3 = hslToRgb((hsl[0] - 0.05), 1, 0.2);
            var rgb4 = hslToRgb((hsl[0] + 0.05), 1, 0.2);
            if (drawbutton(6, ((1140 * fm) - (80 * avm)), (topo + (210 * fm)), 160, 60, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")", "rgb(" + rgb3[0] + "," + rgb3[1] + "," + rgb3[2] + ")", "rgb(" + rgb4[0] + "," + rgb4[1] + "," + rgb4[2] + ")", 0, "Okay ", 21, 0.9, btimg[1], 0.9, false)) {
                ontip = false;
                dudo = 0;
            }
        }
    } else {
        if (stageload == -1) {
            bgsload = new Image();
            bgsload.src = canvas2D.toDataURL("image/png");
            stageloadtyp = 1;
            fase = 3;
        }
    }
    musictog();
}
function tipunlocked() {
    playintertrack();
    tiplocked = cp.stage;
    ontip = true;
    dudo = 0;
    fase = 4;
    requestAnimationFrame(render);
}
function tipunlockedfailed() {
    playintertrack();
    fase = 4;
    requestAnimationFrame(render);
}
function spPolygon(stx, sty, xd, yd, fm, to, enx, eny) {
    rd.beginPath();
    rd.moveTo((stx * mw), (sty * mh));
    for (var i = fm; i < to; i++) {
        rd.lineTo((xd[i] * mw), (yd[i] * mh));
    }
    rd.lineTo((enx * mw), (eny * mh));
    rd.closePath();
    rd.fill();
}
function spdPolygon(xd, yd, nd) {
    rd.beginPath();
    rd.moveTo((xd[0] * mw), (yd[0] * mh));
    for (var i = 1; i < nd; i++) {
        rd.lineTo((xd[i] * mw), (yd[i] * mh));
    }
    rd.closePath();
    rd.stroke();
}
function musictog() {
    onycl = oncla(4, (canw - (62 * avm)), (4 * avm), (58 * avm), (42 * avm));
    if (onycl == 1) {
        rd.globalAlpha = 0.7;
    }
    if (onycl == 2) {
        if (!mutemusic) {
            mutemusic = true;
        } else {
            mutemusic = false;
        }
        if (mutestart) {
            mutestart = false;
        }
    }
    if (!mutemusic) {
        onycl = 4;
    } else {
        onycl = 5;
    }
    rd.drawImage(muimg[onycl], (canw - (62 * avm)), (4 * avm), (58 * avm), (42 * avm));
    rd.globalAlpha = 1;
}
function drawloading() {
    rd.fillStyle = "#15190D";
    rd.fillRect(0, 0, canw, canh);
    var perc = (dataload / datacnt);
    if (perc > 1) {
        perc = 1;
    }
    if (perc < 0.076) {
        perc = 0.076;
    }
    rd.lineWidth = (4 * avm);
    drawcoolrect((640 * mw), (320 * mh), 300, 30, "#FF3D01", "#FFB401", "#6DCA00", perc);
    rd.font = "18px junk";
    rd.letterSpacing = "1px";
    rd.fillStyle = "#15190D";
    if (rd.measureText("crazy game").width > 102) {
        rd.fillStyle = "#6DCA00";
    }
    rd.font = "" + (30 * avm) + "px junk";
    rd.textBaseline = "middle";
    rd.letterSpacing = "1px";
    rd.textAlign = "center";
    rd.fillText("! This Game Is Crazy !", (640 * mw), (250 * mh));
    rd.font = "" + (30 * avm) + "px verd";
    rd.textBaseline = "middle";
    rd.letterSpacing = "0px";
    rd.textAlign = "center";
    rd.fillStyle = "#15190D";
    rd.fillText("LOADING", (640 * mw), (600 * mh));
}
function arrow(pnt, misdcp, pntcar) {
    var xp = [];
    var yp = [];
    var zp = [];
    var cx = 0;
    var cy = -315;
    var cz = 700;
    for (var i = 0; i < 7; i++) {
        yp[i] = cy;
    }
    xp[0] = (cx);
    zp[0] = (cz + 110);
    xp[1] = (cx - 35);
    zp[1] = (cz + 50);
    xp[2] = (cx - 10);
    zp[2] = (cz + 50);
    xp[3] = (cx - 15);
    zp[3] = (cz - 50);
    xp[4] = (cx + 15);
    zp[4] = (cz - 50);
    xp[5] = (cx + 10);
    zp[5] = (cz + 50);
    xp[6] = (cx + 35);
    zp[6] = (cz + 50);
    var an = 0;
    if (!pntcar) {
        var ad = 180;
        if ((cp.x[pnt] - car[im].x) > 0) {
            ad = 0;
        }
        an =  - (90 + ad + ((Math.atan(((cp.z[pnt] - car[im].z) / (cp.x[pnt] - car[im].x))) / 0.017453292519943295)));
    } else {
        findonscreen();
        var pnti = 0;
        var clospy = -1;
        var gotons = false;
        for (var i = 0; i < ncars; i++) {
            if (i != im) {
                var pycar = pyo((car[im].x / 10), (car[i].x / 10), (car[im].z / 10), (car[i].z / 10));
                if ((pycar < clospy) || (clospy == -1)) {
                    if ((!gotons) || (onscreen[i])) {
                        if (cp.dested[i] == 0) {
                            pnti = i;
                            clospy = pycar;
                            if (onscreen[i]) {
                                gotons = true;
                            }
                        }
                    }
                }
            }
        }
        var ad = 180;
        if ((car[pnti].x - car[im].x) > 0) {
            ad = 0;
        }
        an =  - (90 + ad + ((Math.atan(((car[pnti].z - car[im].z) / (car[pnti].x - car[im].x))) / 0.017453292519943295)));
        var stspace = "";
        for (var i = 0; i < cd.names[car[pnti].typ].length; i++) {
            stspace += "  ";
        }
        drawcs(16, "[" + stspace + "]", 76, 67, 240, 1);
        drawcs(18, cd.names[car[pnti].typ], 0, 0, 0, 1);
    }
    an += camxz;
    while (an < 0) {
        an += 360;
    }
    while (an > 180) {
        an -= 360;
    }
    if (!pntcar) {
        if (an > 130) {
            an = 130;
        }
        if (an < -130) {
            an = -130;
        }
    } else {
        if (an > 100) {
            an = 100;
        }
        if (an < -100) {
            an = -100;
        }
    }
    if (Math.abs(ana - an) < 180) {
        if (Math.abs(ana - an) < 10) {
            ana = an;
        } else {
            if (ana < an) {
                ana += 10;
            } else {
                ana -= 10;
            }
        }
    } else {
        if (an < 0) {
            ana += 15;
            if (ana > 180) {
                ana -= 360;
            }
        }
        if (an > 0) {
            ana -= 15;
            if (ana < -180) {
                ana += 360;
            }
        }
    }
    rotate(xp, zp, cx, cz, ana, 7);
    an = Math.abs(ana);
    if (!pntcar) {
        if ((an > 7) || (misdcp > 0) || (misdcp == -2) || (cntan != 0)) {
            for (var i = 0; i < 7; i++) {
                xp[i] = (xs(xp[i], zp[i]) * 1.6 * avm);
                yp[i] = (ys(yp[i], zp[i]) * 1.6 * avm);
                xp[i] += (640 * mw);
                yp[i] += ((360 + adm) * mh);
            }
            var r = 190;
            var g = 255;
            var b = 0;
            if (misdcp <= 0) {
                if ((an <= 45) && (misdcp != -2) && (cntan == 0)) {
                    rd.globalAlpha = (an / 45);
                }
                if (an >= 90) {
                    var tr = 255;
                    r = (((r * (140 - an)) + (tr * (an - 90))) / 50);
                    if (r > 255) {
                        r = 255;
                    }
                }
            } else {
                if (flk) {
                    r = 255;
                    flk = false;
                } else {
                    r = 255;
                    g = 220;
                    flk = true;
                }
            }
            rd.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            fillPolygon(xp, yp, 7);
            rd.globalAlpha = 1;
            r = 115;
            g = 170;
            b = 0;
            if (misdcp <= 0) {
                if ((an <= 45) && (misdcp != -2) && (cntan == 0)) {
                    rd.globalAlpha = (an / 45);
                }
            } else {
                if (flk) {
                    r = 255;
                    g = 0;
                }
            }
            rd.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
            rd.lineWidth = (2.6 * avm);
            drawPolygon(xp, yp, 7);
            rd.globalAlpha = 1;
        }
    } else {
        for (var i = 0; i < 7; i++) {
            xp[i] = (xs(xp[i], zp[i]) * 1.6 * avm);
            yp[i] = (ys(yp[i], zp[i]) * 1.6 * avm);
            xp[i] += (640 * mw);
            yp[i] += ((360 + adm) * mh);
        }
        var r = 159;
        var g = 207;
        var b = 255;
        rd.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        fillPolygon(xp, yp, 7);
        r = 120;
        g = 114;
        b = 255;
        rd.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
        rd.lineWidth = (2.6 * avm);
        drawPolygon(xp, yp, 7);
    }
}
var onscreen = [];
function findonscreen() {
    for (var i = 0; i < ncars; i++) {
        onscreen[i] = false;
        if (i != im) {
            var isinfront = false;
            if ((Math.abs(car[im].mat[8]) > Math.abs(car[im].mat[9])) && (Math.abs(car[im].mat[8]) > Math.abs(car[im].mat[10]))) {
                if (car[im].mat[8] > 0) {
                    if (car[i].x > car[im].x) {
                        isinfront = true;
                    }
                } else {
                    if (car[i].x < car[im].x) {
                        isinfront = true;
                    }
                }
            }
            if ((Math.abs(car[im].mat[9]) > Math.abs(car[im].mat[8])) && (Math.abs(car[im].mat[9]) > Math.abs(car[im].mat[10]))) {
                if (car[im].mat[9] > 0) {
                    if (car[i].y > car[im].y) {
                        isinfront = true;
                    }
                } else {
                    if (car[i].y < car[im].y) {
                        isinfront = true;
                    }
                }
            }
            if ((Math.abs(car[im].mat[10]) > Math.abs(car[im].mat[8])) && (Math.abs(car[im].mat[10]) > Math.abs(car[im].mat[9]))) {
                if (car[im].mat[10] > 0) {
                    if (car[i].z > car[im].z) {
                        isinfront = true;
                    }
                } else {
                    if (car[i].z < car[im].z) {
                        isinfront = true;
                    }
                }
            }
            if (isinfront) {
                var onscpos = getonscreen(cmat, car[i]);
                if ((onscpos[0] >  - (15 * mw)) && (onscpos[0] < (canw + (15 * mw)))) {
                    onscreen[i] = true;
                }
            }
        }
    }
}
function fillPolygon(xd, yd, nd) {
    rd.beginPath();
    rd.moveTo(xd[0], yd[0]);
    for (var i = 1; i < nd; i++) {
        rd.lineTo(xd[i], yd[i]);
    }
    rd.closePath();
    rd.fill();
}
function drawPolygon(xd, yd, nd) {
    rd.beginPath();
    rd.moveTo(xd[0], yd[0]);
    for (var i = 1; i < nd; i++) {
        rd.lineTo(xd[i], yd[i]);
    }
    rd.closePath();
    rd.stroke();
}
function xs(x, z) {
    return ((((z - 400) * -x) / z) + x);
}
function ys(y, z) {
    return ((((z - 400) * -y) / z) + y);
}
function drawcs(y, cs, r, g, b, typ) {
    rd.letterSpacing = "0px";
    rd.font = "" + (11 * (mh + mw)) + "px verd";
    if (typ == 1 || typ == 2) {
        rd.letterSpacing = "1px";
        rd.font = "" + (13 * (mh + mw)) + "px junk";
    }
    if (typ == 3) {
        rd.letterSpacing = "1px";
        rd.font = "" + (24 * (mh + mw)) + "px junk";
    }
    rd.textAlign = "center";
    rd.textBaseline = "middle";
    rd.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    if (typ == 2) {
        rd.globalAlpha = 0.67;
    }
    rd.fillText(cs, (640 * mw), (y * mh));
    if (typ == 2) {
        rd.globalAlpha = 1;
    }
}
function drawbar(xb, yb, cb1, cb2, cbf, fct) {
    rd.fillStyle = cbf;
    rd.fillRect((xb + (7 * avm)), (yb + (6 * avm)), (166 * fct * avm), (18 * avm));
    var grd = rd.createLinearGradient(xb, yb, xb, (yb + (30 * avm)));
    grd.addColorStop(0, cb1);
    grd.addColorStop(1, cb2);
    rd.fillStyle = grd;
    rd.beginPath();
    rd.moveTo(xb, yb);
    rd.lineTo((xb - (9 * avm)), (yb + (10 * avm)));
    rd.lineTo((xb - (1.5 * avm)), (yb + (27 * avm)));
    rd.lineTo((xb + (10 * avm)), (yb + (30 * avm)));
    rd.lineTo((xb + (92 * avm)), (yb + (30 * avm)));
    rd.lineTo((xb + (92 * avm)), (yb + (24 * avm)));
    rd.lineTo((xb + (7 * avm)), (yb + (24 * avm)));
    rd.lineTo((xb + (7 * avm)), (yb + (6 * avm)));
    rd.lineTo((xb + (92 * avm)), (yb + (6 * avm)));
    rd.lineTo((xb + (92 * avm)), yb);
    rd.closePath();
    rd.fill();
    rd.beginPath();
    rd.moveTo((xb + (180 * avm)), (yb + (30 * avm)));
    rd.lineTo((xb + (189 * avm)), (yb + (20 * avm)));
    rd.lineTo((xb + (181.5 * avm)), (yb + (3 * avm)));
    rd.lineTo((xb + (170 * avm)), yb);
    rd.lineTo((xb + (90 * avm)), yb);
    rd.lineTo((xb + (90 * avm)), (yb + (6 * avm)));
    rd.lineTo((xb + (173 * avm)), (yb + (6 * avm)));
    rd.lineTo((xb + (173 * avm)), (yb + (24 * avm)));
    rd.lineTo((xb + (90 * avm)), (yb + (24 * avm)));
    rd.lineTo((xb + (90 * avm)), (yb + (30 * avm)));
    rd.closePath();
    rd.fill();
}
var wasonit = [0, 0, 0, 0];
function drawbutton(onx, xb, yb, wb, hb, cb1, cb2, cb3, cb4, typ, txt, fz, opa, img, iopa, flak) {
    wb = (wb * avm);
    hb = (hb * avm);
    var xbd = (xb - (wb * 0.5) + (5 * avm));
    var ybd = (yb + (4 * avm));
    var clknow = false;
    var hasonx = false;
    var mnms = nms;
    if (mnms < 1) {
        mnms = 1;
    }
    for (var i = 0; i < mnms; i++) {
        if ((xm[i] > (xbd - (hb * 0.3))) && (xm[i] < (xbd + wb + (hb * 0.3))) && (ym[i] > ybd) && (ym[i] < (ybd + hb))) {
            if (mdown) {
                wasonit[i] = onx;
                hasonx = true;
            } else {
                if (wasonit[i] == onx) {
                    clknow = true;
                    wasonit[i] = 0;
                }
            }
        } else {
            if (wasonit[i] == onx) {
                wasonit[i] = 0;
            }
        }
    }
    var flwu = 2;
    var flhu = 0.5;
    if (flak) {
        flwu = flw;
        flhu = flh;
    }
    if (!hasonx) {
        var grd = rd.createLinearGradient(xbd, (ybd - (hb * 0.5)), (xbd + (wb * 0.5 * flwu)), (ybd - (hb * 0.5) + (hb * flhu)));
        grd.addColorStop(0, cb3);
        grd.addColorStop(1, cb4);
        rd.fillStyle = grd;
        rd.beginPath();
        rd.moveTo(xbd, ybd);
        rd.lineTo((xbd - (hb * 0.3)), (ybd + (hb * 0.3334)));
        rd.lineTo((xbd - (hb * 0.05)), (ybd + (hb * 0.9)));
        rd.lineTo((xbd + (hb * 0.1)), (ybd + hb));
        rd.lineTo((xbd + wb), (ybd + hb));
        rd.lineTo((xbd + wb + (hb * 0.3)), (ybd + (hb * 0.6667)));
        rd.lineTo((xbd + wb + (hb * 0.05)), (ybd + (hb * 0.1)));
        rd.lineTo((xbd + wb - (hb * 0.1)), ybd);
        rd.closePath();
        rd.fill();
        xbd = (xb - (wb * 0.5));
        ybd = yb;
    }
    var grd = rd.createLinearGradient(xbd, (ybd - (hb * 0.5)), (xbd + (wb * 0.5 * flwu)), (ybd - (hb * 0.5) + (hb * flhu)));
    grd.addColorStop(0, cb1);
    grd.addColorStop(1, cb2);
    rd.fillStyle = grd;
    rd.beginPath();
    rd.moveTo(xbd, ybd);
    rd.lineTo((xbd - (hb * 0.3)), (ybd + (hb * 0.3334)));
    rd.lineTo((xbd - (hb * 0.05)), (ybd + (hb * 0.9)));
    rd.lineTo((xbd + (hb * 0.1)), (ybd + hb));
    rd.lineTo((xbd + wb), (ybd + hb));
    rd.lineTo((xbd + wb + (hb * 0.3)), (ybd + (hb * 0.6667)));
    rd.lineTo((xbd + wb + (hb * 0.05)), (ybd + (hb * 0.1)));
    rd.lineTo((xbd + wb - (hb * 0.1)), ybd);
    rd.closePath();
    rd.fill();
    var wti = 0;
    if (typ == 0 || typ == 3) {
        rd.font = "" + (fz * (mh + mw)) + "px junk";
        rd.letterSpacing = "1px";
        wti = (rd.measureText(txt).width + (10 * avm) + (img.width * avm * rdres));
    }
    if (typ == 1) {
        rd.font = "" + (fz * (mh + mw)) + "px junk";
        rd.letterSpacing = "1px";
        wti = rd.measureText(txt).width;
    }
    if (typ == 2) {
        wti = (img.width * avm * rdres);
    }
    if (typ == 0 || typ == 1) {
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#000000";
        rd.globalAlpha = opa;
        rd.fillText(txt, (xbd + (wb * 0.5) - (wti * 0.5) + (fz * avm * 0.3)), (ybd + (hb * 0.5) - (fz * avm * 0.25)));
        rd.globalAlpha = 1;
    }
    if (typ == 0 || typ == 2) {
        rd.globalAlpha = iopa;
        rd.drawImage(img, (xbd + (wb * 0.5) + (wti * 0.5) - (img.width * avm * rdres)), (ybd + (hb * 0.5) - (img.height * avm * 0.5 * rdres)), (img.width * avm * rdres), (img.height * avm * rdres));
        rd.globalAlpha = 1;
    }
    if (typ == 3) {
        rd.globalAlpha = iopa;
        rd.drawImage(img, (xbd + (wb * 0.5) - (wti * 0.5)), (ybd + (hb * 0.5) - (img.height * avm * 0.5 * rdres)), (img.width * avm * rdres), (img.height * avm * rdres));
        rd.globalAlpha = 1;
        rd.textBaseline = "middle";
        rd.textAlign = "left";
        rd.fillStyle = "#000000";
        rd.globalAlpha = opa;
        rd.fillText(txt, (xbd + (wb * 0.5) + (wti * 0.5) - rd.measureText(txt).width - (fz * avm * 0.3)), (ybd + (hb * 0.5) - (fz * avm * 0.25)));
        rd.globalAlpha = 1;
    }
    return clknow;
}
function oncla(onx, xa, ya, wa, ha) {
    var oncl = 0;
    var mnms = nms;
    if (mnms < 1) {
        mnms = 1;
    }
    for (var i = 0; i < mnms; i++) {
        if ((xm[i] > xa) && (xm[i] < (xa + wa)) && (ym[i] > ya) && (ym[i] < (ya + ha))) {
            if (mdown) {
                wasonit[i] = onx;
                oncl = 1;
            } else {
                if (wasonit[i] == onx) {
                    oncl = 2;
                    wasonit[i] = 0;
                }
            }
        } else {
            if (wasonit[i] == onx) {
                wasonit[i] = 0;
            }
        }
    }
    return oncl;
}
function drawcoolrect(xb, yb, wb, hb, cb1, cb2, cbs, per) {
    wb = (wb * avm);
    hb = (hb * avm);
    var xbd = (xb - (wb * 0.5));
    var ybd = yb;
    var grd = rd.createLinearGradient(xbd, (ybd - (hb * 0.5)), (xbd + wb), (ybd + (hb * 0.5)));
    grd.addColorStop(0, cb1);
    grd.addColorStop(1, cb2);
    rd.fillStyle = grd;
    rd.beginPath();
    rd.moveTo(xbd, ybd);
    rd.lineTo((xbd - (hb * 0.3)), (ybd + (hb * 0.3334)));
    rd.lineTo((xbd - (hb * 0.05)), (ybd + (hb * 0.9)));
    rd.lineTo((xbd + (hb * 0.1)), (ybd + hb));
    rd.lineTo((xbd + (wb * per)), (ybd + hb));
    rd.lineTo((xbd + (wb * per) + (hb * 0.3)), (ybd + (hb * 0.6667)));
    rd.lineTo((xbd + (wb * per) + (hb * 0.05)), (ybd + (hb * 0.1)));
    rd.lineTo((xbd + (wb * per) - (hb * 0.1)), ybd);
    rd.closePath();
    rd.fill();
    rd.lineWidth = (3 * avm);
    rd.strokeStyle = cbs;
    rd.beginPath();
    rd.moveTo(xbd, ybd);
    rd.lineTo((xbd - (hb * 0.3)), (ybd + (hb * 0.3334)));
    rd.lineTo((xbd - (hb * 0.05)), (ybd + (hb * 0.9)));
    rd.lineTo((xbd + (hb * 0.1)), (ybd + hb));
    rd.lineTo((xbd + wb), (ybd + hb));
    rd.lineTo((xbd + wb + (hb * 0.3)), (ybd + (hb * 0.6667)));
    rd.lineTo((xbd + wb + (hb * 0.05)), (ybd + (hb * 0.1)));
    rd.lineTo((xbd + wb - (hb * 0.1)), ybd);
    rd.closePath();
    rd.stroke();
}
function createbordo() {
    for (var i = 0; i < 16; i++) {
        xsp[i] = (50 + (i * 73.75) + (Math.random() * 60) - 30);
        ysp[i] = (50 + (Math.random() * 30) - 15);
    }
    var cntout = 0;
    for (var i = 0; i < 14; i++) {
        if ((cntout == 0) && (Math.abs(ysp[i] - ysp[i + 1]) < 7) && (Math.abs(ysp[i] - ysp[i + 2]) < 7) && (xsp[i + 1] < 460 || xsp[i + 1] > 820)) {
            if (Math.random() > Math.random() || xsp[i + 1] > 820) {
                ysp[i + 1] += (30 + (Math.random() * 30));
                xsp[i] = (((xsp[i + 1] * 5) + xsp[i]) / 6);
                xsp[(i + 2)] = (((xsp[i + 1] * 5) + xsp[(i + 2)]) / 6);
            }
            cntout = 3;
        }
        if (cntout != 0) {
            cntout--;
        }
    }
    for (var i = 16; i < 25; i++) {
        xsp[i] = (1230 + (Math.random() * 30) - 15);
        ysp[i] = (50 + ((i - 16) * 68.88) + (Math.random() * 60) - 30);
    }
    cntout = 0;
    for (var i = 16; i < 23; i++) {
        if ((cntout == 0) && (Math.abs(xsp[i] - xsp[i + 1]) < 7) && (Math.abs(xsp[i] - xsp[i + 2]) < 7) && (ysp[i + 1] < 330)) {
            xsp[i + 1] -= (30 + (Math.random() * 30));
            ysp[i] = (((ysp[i + 1] * 5) + ysp[i]) / 6);
            ysp[(i + 2)] = (((ysp[i + 1] * 5) + ysp[(i + 2)]) / 6);
            cntout = 10;
        }
        if (cntout != 0) {
            cntout--;
        }
    }
    for (var i = 25; i < 41; i++) {
        xsp[i] = (1230 - ((i - 25) * 73.75) + (Math.random() * 60) - 30);
        ysp[i] = (670 + (Math.random() * 30) - 15);
    }
    cntout = 0;
    var vony = 876;
    if (cp.stage == 1 || cp.stage == 2) {
        vony = 580;
    }
    for (var i = 25; i < 39; i++) {
        if ((cntout == 0) && (Math.abs(ysp[i] - ysp[i + 1]) < 7) && (Math.abs(ysp[i] - ysp[i + 2]) < 7) && (xsp[i + 1] < vony) && ((xsp[i + 1] > 572) || (!hastip))) {
            if (Math.random() > Math.random()) {
                ysp[i + 1] -= (30 + (Math.random() * 30));
                xsp[i] = (((xsp[i + 1] * 5) + xsp[i]) / 6);
                xsp[(i + 2)] = (((xsp[i + 1] * 5) + xsp[(i + 2)]) / 6);
            }
            cntout = 3;
        }
        if (cntout != 0) {
            cntout--;
        }
    }
    for (var i = 41; i < 50; i++) {
        xsp[i] = (50 + (Math.random() * 30) - 15);
        ysp[i] = (670 - ((i - 41) * 68.88) + (Math.random() * 60) - 30);
    }
    cntout = 0;
    for (var i = 41; i < 48; i++) {
        if ((cntout == 0) && (Math.abs(xsp[i] - xsp[i + 1]) < 7) && (Math.abs(xsp[i] - xsp[i + 2]) < 7) && (ysp[i + 1] < 330 || ysp[i + 1] > 450)) {
            if (Math.random() > Math.random()) {
                xsp[i + 1] += (30 + (Math.random() * 30));
                ysp[i] = (((ysp[i + 1] * 5) + ysp[i]) / 6);
                ysp[(i + 2)] = (((ysp[i + 1] * 5) + ysp[(i + 2)]) / 6);
            }
            cntout = 3;
        }
        if (cntout != 0) {
            cntout--;
        }
    }
    xsp[50] = xsp[0];
    ysp[50] = ysp[0];
}
function floatytalk(x, y, width, height, cornerRadius) {
    rd.beginPath();
    rd.moveTo(x + cornerRadius, y);
    rd.lineTo(x + width - cornerRadius, y);
    rd.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
    rd.lineTo(x + width, y + height - cornerRadius);
    rd.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
    rd.lineTo(x + cornerRadius, y + height);
    rd.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
    var fm = mw;
    if ((mw / mh) > 1.2) {
        fm *= (1.2 / (mw / mh));
    }
    rd.lineTo(x, ((260 * mh) + (200 * fm)));
    rd.lineTo((150 * fm), ((260 * mh) + (200 * fm)));
    rd.lineTo(x, ((260 * mh) + (230 * fm)));
    rd.lineTo(x, y + cornerRadius);
    rd.quadraticCurveTo(x, y, x + cornerRadius, y);
    rd.fill();
}
function floatythink(x, y, width, height, cornerRadius) {
    rd.beginPath();
    rd.moveTo(x + cornerRadius, y);
    rd.lineTo(x + width - cornerRadius, y);
    rd.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
    rd.lineTo(x + width, y + height - cornerRadius);
    rd.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
    rd.lineTo(x + cornerRadius, y + height);
    rd.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
    rd.lineTo(x, y + cornerRadius);
    rd.quadraticCurveTo(x, y, x + cornerRadius, y);
    rd.fill();
}
function newrepcar() {
    return {
        x: [],
        y: [],
        z: [],
        xy: [],
        xz: [],
        zy: [],
        wzy: [],
        wxz: [],
        avnx: [],
        avny: [],
        avnz: [],
        nreg: 0,
        regat: [],
        regnr: [],
        regk: [],
        regmag: [],
        regmtch: [],
        nfix: 0,
        fixat: [],
        destat: 700,
        destedbyzero: 0,
        ndst: 0,
        dstat: [],
        tskd: [],
        mst: [],
        dx: [],
        dy: [],
        dz: [],
        sx: [],
        sz: [],
        smag: [],
        tlt: [],
        capsz: []
    };
}
function newrepsprks() {
    return {
        n: 0,
        sprkat: [],
        cn: [],
        x: [],
        y: [],
        z: [],
        sx: [],
        sy: [],
        sz: [],
        cap: []
    };
}
var repcar = null;
var hrepcar = null;
var repsprks = null;
var hrepsprks = null;
var reponcheckpoint = [];
var reponlastcheck = [];
var hreponcheckpoint = [];
var hreponlastcheck = [];
var nrec = 0;
var htyp = 0;
var hat = 0;
var hscar = 0;
var hpowerup = 0;
var rpdcatch = 0;
var catchfin = 0;
function inishrecord() {
    if (repcar != null) {
        repcar = null;
    }
    if (hrepcar != null) {
        hrepcar = null;
    }
    repcar = [];
    hrepcar = [];
    for (var c = 0; c < ncars; c++) {
        repcar[c] = newrepcar();
        for (var i = 0; i < 430; i++) {
            repcar[c].x[i] = 0;
            repcar[c].y[i] = 0;
            repcar[c].z[i] = 0;
            repcar[c].xy[i] = 0;
            repcar[c].xz[i] = 0;
            repcar[c].zy[i] = 0;
            repcar[c].wzy[i] = 0;
            repcar[c].wxz[i] = 0;
            repcar[c].avnx[i] = 0;
            repcar[c].avny[i] = 0;
            repcar[c].avnz[i] = 0;
        }
        hrepcar[c] = newrepcar();
        for (var i = 0; i < 430; i++) {
            hrepcar[c].x[i] = 0;
            hrepcar[c].y[i] = 0;
            hrepcar[c].z[i] = 0;
            hrepcar[c].xy[i] = 0;
            hrepcar[c].xz[i] = 0;
            hrepcar[c].zy[i] = 0;
            hrepcar[c].wzy[i] = 0;
            hrepcar[c].wxz[i] = 0;
            hrepcar[c].avnx[i] = 0;
            hrepcar[c].avny[i] = 0;
            hrepcar[c].avnz[i] = 0;
        }
    }
    if (repsprks != null) {
        repsprks = null;
    }
    if (hrepsprks != null) {
        hrepsprks = null;
    }
    repsprks = newrepsprks();
    hrepsprks = newrepsprks();
    for (var i = 0; i < 430; i++) {
        reponcheckpoint[i] = 0;
        reponlastcheck[i] = 0;
    }
    nrec = 0;
    htyp = 0;
    hpowerup = 0;
    hat = 0;
    hscar = 0;
    catchfin = 0;
}
function record() {
    for (var c = 0; c < ncars; c++) {
        for (var i = 0; i < 429; i++) {
            repcar[c].x[i] = repcar[c].x[i + 1];
            repcar[c].y[i] = repcar[c].y[i + 1];
            repcar[c].z[i] = repcar[c].z[i + 1];
            repcar[c].xy[i] = repcar[c].xy[i + 1];
            repcar[c].xz[i] = repcar[c].xz[i + 1];
            repcar[c].zy[i] = repcar[c].zy[i + 1];
            repcar[c].wzy[i] = repcar[c].wzy[i + 1];
            repcar[c].wxz[i] = repcar[c].wxz[i + 1];
            if (repcar[c].destat != 700) {
                repcar[c].avnx[i] = repcar[c].avnx[i + 1];
                repcar[c].avny[i] = repcar[c].avny[i + 1];
                repcar[c].avnz[i] = repcar[c].avnz[i + 1];
            }
        }
        repcar[c].x[429] = car[c].x;
        repcar[c].y[429] = car[c].y;
        repcar[c].z[429] = car[c].z;
        repcar[c].xy[429] = car[c].xy;
        repcar[c].xz[429] = car[c].xz;
        repcar[c].zy[429] = car[c].zy;
        repcar[c].wzy[429] = car[c].wzy;
        repcar[c].wxz[429] = car[c].wxz;
        if (repcar[c].destat != 700) {
            repcar[c].avnx[429] = ((scx[c][0] + scx[c][1] + scx[c][2] + scx[c][3]) / 4);
            repcar[c].avny[429] = ((scy[c][0] + scy[c][1] + scy[c][2] + scy[c][3]) / 4);
            repcar[c].avnz[429] = ((scz[c][0] + scz[c][1] + scz[c][2] + scz[c][3]) / 4);
        }
        for (var i = 0; i < repcar[c].nreg; i++) {
            repcar[c].regat[i]--;
        }
        for (var i = 0; i < repcar[c].nfix; i++) {
            repcar[c].fixat[i]--;
        }
        for (var i = 0; i < repcar[c].ndst; i++) {
            repcar[c].dstat[i]--;
        }
        if (repcar[c].destat != 700) {
            repcar[c].destat--;
            if (repcar[c].destat == 328) {
                if (c == 0) {
                    catchnow(2);
                    if (htyp == 2) {
                        hat = 327;
                    }
                } else {
                    if (repcar[c].destedbyzero) {
                        catchnow(3);
                        if (htyp == 3) {
                            hat = Math.floor((160 + repcar[c].destedbyzero) * 1.42);
                            hscar = c;
                        }
                    }
                }
            }
        }
    }
    for (var i = 0; i < repsprks.n; i++) {
        repsprks.sprkat[i]--;
    }
    for (var i = 0; i < 430; i++) {
        reponcheckpoint[i] = reponcheckpoint[i + 1];
        reponlastcheck[i] = reponlastcheck[i + 1];
    }
    reponcheckpoint[429] = oncheckpoint;
    reponlastcheck[429] = onlastcheck;
    if (nrec < 430) {
        nrec++;
    }
}
function recordust(tskd, c, mst, x, y, z, sx, sz, smag, tlt, capsz) {
    var ui = -1;
    for (var i = 0; i < repcar[c].ndst; i++) {
        if (repcar[c].dstat[i] < 0) {
            ui = i;
            break;
        }
    }
    if (ui == -1) {
        ui = repcar[c].ndst;
        repcar[c].ndst++;
    }
    repcar[c].dstat[ui] = 430;
    repcar[c].tskd[ui] = tskd;
    repcar[c].mst[ui] = mst;
    repcar[c].dx[ui] = x;
    repcar[c].dy[ui] = y;
    repcar[c].dz[ui] = z;
    repcar[c].sx[ui] = sx;
    repcar[c].sz[ui] = sz;
    repcar[c].smag[ui] = smag;
    repcar[c].tlt[ui] = tlt;
    repcar[c].capsz[ui] = capsz;
}
function recordsprks(cn, x, y, z, sx, sy, sz, cap) {
    var ui = -1;
    for (var i = 0; i < repsprks.n; i++) {
        if (repsprks.sprkat[i] < 0) {
            ui = i;
            break;
        }
    }
    if (ui == -1) {
        ui = repsprks.n;
        repsprks.n++;
    }
    repsprks.sprkat[ui] = 430;
    repsprks.cn[ui] = cn;
    repsprks.x[ui] = x;
    repsprks.y[ui] = y;
    repsprks.z[ui] = z;
    repsprks.sx[ui] = sx;
    repsprks.sy[ui] = sy;
    repsprks.sz[ui] = sz;
    repsprks.cap[ui] = cap;
}
function catchnow(hty) {
    if (nrec >= 430) {
        for (var c = 0; c < ncars; c++) {
            for (var i = 0; i < 430; i++) {
                hrepcar[c].x[i] = repcar[c].x[i];
                hrepcar[c].y[i] = repcar[c].y[i];
                hrepcar[c].z[i] = repcar[c].z[i];
                hrepcar[c].xy[i] = repcar[c].xy[i];
                hrepcar[c].xz[i] = repcar[c].xz[i];
                hrepcar[c].zy[i] = repcar[c].zy[i];
                hrepcar[c].wzy[i] = repcar[c].wzy[i];
                hrepcar[c].wxz[i] = repcar[c].wxz[i];
                hrepcar[c].avnx[i] = repcar[c].avnx[i];
                hrepcar[c].avny[i] = repcar[c].avny[i];
                hrepcar[c].avnz[i] = repcar[c].avnz[i];
                hrepcar[c].nreg = repcar[c].nreg;
                hrepcar[c].nfix = repcar[c].nfix;
                hrepcar[c].ndst = repcar[c].ndst;
                hrepcar[c].destat = repcar[c].destat;
            }
            for (var i = 0; i < hrepcar[c].nreg; i++) {
                hrepcar[c].regat[i] = repcar[c].regat[i];
                hrepcar[c].regmtch[i] = repcar[c].regmtch[i];
                hrepcar[c].regnr[i] = repcar[c].regnr[i];
                hrepcar[c].regk[i] = repcar[c].regk[i];
                hrepcar[c].regmag[i] = repcar[c].regmag[i];
            }
            for (var i = 0; i < hrepcar[c].nfix; i++) {
                hrepcar[c].fixat[i] = repcar[c].fixat[i];
            }
            for (var i = 0; i < hrepcar[c].ndst; i++) {
                hrepcar[c].dstat[i] = repcar[c].dstat[i];
                hrepcar[c].tskd[i] = repcar[c].tskd[i];
                hrepcar[c].mst[i] = repcar[c].mst[i];
                hrepcar[c].dx[i] = repcar[c].dx[i];
                hrepcar[c].dy[i] = repcar[c].dy[i];
                hrepcar[c].dz[i] = repcar[c].dz[i];
                hrepcar[c].sx[i] = repcar[c].sx[i];
                hrepcar[c].sz[i] = repcar[c].sz[i];
                hrepcar[c].smag[i] = repcar[c].smag[i];
                hrepcar[c].tlt[i] = repcar[c].tlt[i];
                hrepcar[c].capsz[i] = repcar[c].capsz[i];
            }
        }
        hrepsprks.n = repsprks.n;
        for (var i = 0; i < hrepsprks.n; i++) {
            hrepsprks.sprkat[i] = repsprks.sprkat[i];
            hrepsprks.cn[i] = repsprks.cn[i];
            hrepsprks.x[i] = repsprks.x[i];
            hrepsprks.y[i] = repsprks.y[i];
            hrepsprks.z[i] = repsprks.z[i];
            hrepsprks.sx[i] = repsprks.sx[i];
            hrepsprks.sy[i] = repsprks.sy[i];
            hrepsprks.sz[i] = repsprks.sz[i];
            hrepsprks.cap[i] = repsprks.cap[i];
        }
        for (var i = 0; i < 430; i++) {
            hreponcheckpoint[i] = reponcheckpoint[i];
            hreponlastcheck[i] = reponlastcheck[i];
        }
        htyp = hty;
    } else {
        hpowerup = 0;
    }
}
var fr = 0;
var destnow = [];
function rewindreplay() {
    fase = 9;
    fr = 0;
    camode = 1;
    cim = 0;
    for (var c = 0; c < ncars; c++) {
        destnow[c] = false;
        cntdest[c] = 0;
        embos[c] = 0;
        embodir[c] = 0;
        squash[c] = 0;
        nbsq[c] = 0;
        car[c].fcnt = 0;
        fixcar(c);
        carobj[car[c].typ].alpha = 1;
        if (repcar[c].destat < 0) {
            destnow[c] = true;
            cntdest[c] = 7;
        }
        var foundnegfix = 0;
        for (var i = (repcar[c].nfix - 1); i >= 0; i--) {
            if ((repcar[c].fixat[i] < 0) && (foundnegfix == 0)) {
                foundnegfix = repcar[c].fixat[i];
                break;
            }
        }
        for (var i = 0; i < repcar[c].nreg; i++) {
            if (repcar[c].regat[i] < 0) {
                var frget = false;
                if (foundnegfix) {
                    if (repcar[c].regat[i] < foundnegfix) {
                        frget = true;
                    }
                }
                if (!frget) {
                    mtouch[c] = repcar[c].regmtch[i];
                    regn(repcar[c].regnr[i], repcar[c].regk[i], repcar[c].regmag[i], c);
                }
            }
        }
    }
    requestAnimationFrame(render);
    fase = 8;
}
function replay() {
    for (var c = 0; c < ncars; c++) {
        if (repcar[c].destat == fr) {
            destnow[c] = true;
        }
        if (destnow[c]) {
            if (cntdest[c] < 6) {
                if (embos[c] == 0) {
                    carobj[car[c].typ].alpha = 1;
                    embodir[c] = Math.floor(Math.random() * 3);
                    if (embodir[c] == 3) {
                        embodir[c] = 0;
                    }
                    embomag[c] = (1.2 + (Math.random() * 0.2));
                }
                if (embos[c] == 1) {
                    carobj[car[c].typ].alpha = 2;
                }
                embos[c]++;
                if (embos[c] == 2) {
                    embos[c] = 0;
                    cntdest[c]++;
                }
            } else {
                if (cntdest[c] == 6) {
                    carobj[car[c].typ].alpha = 1;
                    embodir[c] = 0;
                    chipburn(c);
                    embos[c] = 0;
                    cntdest[c] = 7;
                }
                firexp(c, repcar[c].avnx[fr], repcar[c].avny[fr], repcar[c].avnz[fr]);
                if (cntdest[c] < 24) {
                    embos[c]++;
                    if (embos[c] == 5) {
                        burn(c);
                        embos[c] = 0;
                        cntdest[c]++;
                    }
                }
            }
        }
        if (!car[c].fcnt) {
            for (var i = 0; i < repcar[c].nfix; i++) {
                if (repcar[c].fixat[i] == fr) {
                    car[c].fcnt = 20;
                }
            }
        } else {
            onelec = true;
            carobj[car[c].typ].alpha = 1;
            if (car[c].fcnt % 2 == 0) {
                if (Math.random() > 0.333) {
                    if (Math.random() > Math.random()) {
                        carobj[car[c].typ].alpha = 3;
                    } else {
                        carobj[car[c].typ].alpha = 2;
                    }
                }
            }
            if (frgm >= m) {
                if (car[c].fcnt == 20) {
                    squash[c] = 0;
                    nbsq[c] = 0;
                }
                if (car[c].fcnt == 15) {
                    newcar[c] = true;
                }
                if (car[c].fcnt == 5) {
                    fixcar(c);
                }
                car[c].fcnt--;
            }
        }
        for (var i = 0; i < repcar[c].nreg; i++) {
            if (repcar[c].regat[i] == fr) {
                mtouch[c] = repcar[c].regmtch[i];
                regn(repcar[c].regnr[i], repcar[c].regk[i], repcar[c].regmag[i], c);
            }
        }
        for (var i = 0; i < repcar[c].ndst; i++) {
            if (repcar[c].dstat[i] == fr) {
                dustup(repcar[c].tskd[i], c, repcar[c].mst[i], repcar[c].dx[i], repcar[c].dy[i], repcar[c].dz[i], repcar[c].sx[i], repcar[c].sz[i], repcar[c].smag[i], repcar[c].tlt[i], repcar[c].capsz[i]);
            }
        }
        car[c].x = repcar[c].x[fr];
        car[c].y = repcar[c].y[fr];
        car[c].z = repcar[c].z[fr];
        car[c].xy = repcar[c].xy[fr];
        car[c].xz = repcar[c].xz[fr];
        car[c].zy = repcar[c].zy[fr];
        car[c].wzy = repcar[c].wzy[fr];
        car[c].wxz = repcar[c].wxz[fr];
        var xmt = [1, 0, 0];
        var ymt = [0, 1, 0];
        var zmt = [0, 0, 1];
        rotomat(xmt, ymt, car[c].xy);
        rotomat(ymt, zmt, car[c].zy);
        rotomat(xmt, zmt, car[c].xz);
        car[c].mat[0] = xmt[0];
        car[c].mat[1] = ymt[0];
        car[c].mat[2] = zmt[0];
        car[c].mat[4] = xmt[1];
        car[c].mat[5] = ymt[1];
        car[c].mat[6] = zmt[1];
        car[c].mat[8] = xmt[2];
        car[c].mat[9] = ymt[2];
        car[c].mat[10] = zmt[2];
        if (embodir[c]) {
            car[c].mat[(embodir[c] * 4)] *= embomag[c];
            car[c].mat[((embodir[c] * 4) + 1)] *= embomag[c];
            car[c].mat[((embodir[c] * 4) + 2)] *= embomag[c];
        }
    }
    for (var i = 0; i < repsprks.n; i++) {
        if (repsprks.sprkat[i] == fr) {
            sprks(repsprks.cn[i], repsprks.x[i], repsprks.y[i], repsprks.z[i], repsprks.sx[i], repsprks.sy[i], repsprks.sz[i], repsprks.cap[i]);
        }
    }
    oncheckpoint = reponcheckpoint[fr];
    onlastcheck = reponlastcheck[fr];
    if (fr == 429) {
        fase = 11;
        camode = 0;
        cim = 0;
        fr = 0;
    } else {
        fr++;
    }
}
function fastforwardexit() {
    fase = 9;
    for (var c = 0; c < ncars; c++) {
        if ((repcar[c].destat != 700) && (repcar[c].destat >= fr)) {
            embos[c] = 0;
            cntdest[c] = 7;
        }
        var foundnegfix = 0;
        for (var i = (repcar[c].nfix - 1); i >= 0; i--) {
            if ((repcar[c].fixat[i] >= fr) && (foundnegfix == 0)) {
                foundnegfix = repcar[c].fixat[i];
                break;
            }
        }
        if (foundnegfix) {
            squash[c] = 0;
            nbsq[c] = 0;
            car[c].fcnt = 0;
            fixcar(c);
        }
        for (var i = 0; i < repcar[c].nreg; i++) {
            if (repcar[c].regat[i] >= fr) {
                var frget = false;
                if (foundnegfix) {
                    if (repcar[c].regat[i] < foundnegfix) {
                        frget = true;
                    }
                }
                if (!frget) {
                    mtouch[c] = repcar[c].regmtch[i];
                    regn(repcar[c].regnr[i], repcar[c].regk[i], repcar[c].regmag[i], c);
                }
            }
        }
        car[c].x = repcar[c].x[429];
        car[c].y = repcar[c].y[429];
        car[c].z = repcar[c].z[429];
        car[c].xy = repcar[c].xy[429];
        car[c].xz = repcar[c].xz[429];
        car[c].zy = repcar[c].zy[429];
        car[c].wzy = repcar[c].wzy[429];
        car[c].wxz = repcar[c].wxz[429];
    }
    camode = 0;
    cim = 0;
    fase = 11;
}
function hrewindhreplay() {
    fase = 9;
    fr = 0;
    for (var c = 0; c < ncars; c++) {
        destnow[c] = false;
        cntdest[c] = 0;
        embos[c] = 0;
        embodir[c] = 0;
        squash[c] = 0;
        nbsq[c] = 0;
        car[c].fcnt = 0;
        fixcar(c);
        carobj[car[c].typ].alpha = 1;
        if (hrepcar[c].destat < 0) {
            destnow[c] = true;
            cntdest[c] = 7;
        }
        var foundnegfix = 0;
        for (var i = (hrepcar[c].nfix - 1); i >= 0; i--) {
            if ((hrepcar[c].fixat[i] < 0) && (foundnegfix == 0)) {
                foundnegfix = hrepcar[c].fixat[i];
                break;
            }
        }
        for (var i = 0; i < hrepcar[c].nreg; i++) {
            if (hrepcar[c].regat[i] < 0) {
                var frget = false;
                if (foundnegfix) {
                    if (hrepcar[c].regat[i] < foundnegfix) {
                        frget = true;
                    }
                }
                if (!frget) {
                    mtouch[c] = hrepcar[c].regmtch[i];
                    regn(hrepcar[c].regnr[i], hrepcar[c].regk[i], hrepcar[c].regmag[i], c);
                }
            }
        }
    }
    holdf = 0;
    rmode = 0;
    if (htyp == 1) {
        if (Math.random() > Math.random()) {
            rmode = 98;
        } else {
            rmode = 43;
        }
    }
    if (htyp == 2) {
        rmode = 95;
        vxz += 90;
    }
    fase = 10;
}
function hreplay() {
    for (var c = 0; c < ncars; c++) {
        if (hrepcar[c].destat == fr) {
            destnow[c] = true;
        }
        if (destnow[c]) {
            if (cntdest[c] < 6) {
                if (embos[c] == 0) {
                    carobj[car[c].typ].alpha = 1;
                    embodir[c] = Math.floor(Math.random() * 3);
                    if (embodir[c] == 3) {
                        embodir[c] = 0;
                    }
                    embomag[c] = (1.2 + (Math.random() * 0.2));
                }
                if (embos[c] == 1) {
                    carobj[car[c].typ].alpha = 2;
                }
                embos[c]++;
                if (embos[c] == 2) {
                    embos[c] = 0;
                    if (!onpausefr) {
                        cntdest[c]++;
                    }
                }
            } else {
                if (cntdest[c] == 6) {
                    carobj[car[c].typ].alpha = 1;
                    embodir[c] = 0;
                    chipburn(c);
                    embos[c] = 0;
                    cntdest[c] = 7;
                }
                firexp(c, hrepcar[c].avnx[fr], hrepcar[c].avny[fr], hrepcar[c].avnz[fr]);
                if (cntdest[c] < 24) {
                    embos[c]++;
                    if (embos[c] == 5) {
                        burn(c);
                        embos[c] = 0;
                        cntdest[c]++;
                    }
                }
            }
        }
        if (!car[c].fcnt) {
            for (var i = 0; i < hrepcar[c].nfix; i++) {
                if (hrepcar[c].fixat[i] == fr) {
                    car[c].fcnt = 20;
                }
            }
        } else {
            onelec = true;
            carobj[car[c].typ].alpha = 1;
            if (car[c].fcnt % 2 == 0) {
                if (Math.random() > 0.333) {
                    if (Math.random() > Math.random()) {
                        carobj[car[c].typ].alpha = 3;
                    } else {
                        carobj[car[c].typ].alpha = 2;
                    }
                }
            }
            if (frgm >= m) {
                if (car[c].fcnt == 20) {
                    squash[c] = 0;
                    nbsq[c] = 0;
                }
                if (car[c].fcnt == 15) {
                    newcar[c] = true;
                }
                if (car[c].fcnt == 5) {
                    fixcar(c);
                }
                car[c].fcnt--;
            }
        }
        if (!onpausefr) {
            for (var i = 0; i < hrepcar[c].nreg; i++) {
                if (hrepcar[c].regat[i] == fr) {
                    mtouch[c] = hrepcar[c].regmtch[i];
                    regn(hrepcar[c].regnr[i], hrepcar[c].regk[i], hrepcar[c].regmag[i], c);
                }
            }
        }
        for (var i = 0; i < hrepcar[c].ndst; i++) {
            if (hrepcar[c].dstat[i] == fr) {
                dustup(hrepcar[c].tskd[i], c, hrepcar[c].mst[i], hrepcar[c].dx[i], hrepcar[c].dy[i], hrepcar[c].dz[i], hrepcar[c].sx[i], hrepcar[c].sz[i], hrepcar[c].smag[i], hrepcar[c].tlt[i], hrepcar[c].capsz[i]);
            }
        }
        car[c].x = hrepcar[c].x[fr];
        car[c].y = hrepcar[c].y[fr];
        car[c].z = hrepcar[c].z[fr];
        car[c].xy = hrepcar[c].xy[fr];
        car[c].xz = hrepcar[c].xz[fr];
        car[c].zy = hrepcar[c].zy[fr];
        car[c].wzy = hrepcar[c].wzy[fr];
        car[c].wxz = hrepcar[c].wxz[fr];
        var xmt = [1, 0, 0];
        var ymt = [0, 1, 0];
        var zmt = [0, 0, 1];
        rotomat(xmt, ymt, car[c].xy);
        rotomat(ymt, zmt, car[c].zy);
        rotomat(xmt, zmt, car[c].xz);
        car[c].mat[0] = xmt[0];
        car[c].mat[1] = ymt[0];
        car[c].mat[2] = zmt[0];
        car[c].mat[4] = xmt[1];
        car[c].mat[5] = ymt[1];
        car[c].mat[6] = zmt[1];
        car[c].mat[8] = xmt[2];
        car[c].mat[9] = ymt[2];
        car[c].mat[10] = zmt[2];
        if (embodir[c]) {
            car[c].mat[(embodir[c] * 4)] *= embomag[c];
            car[c].mat[((embodir[c] * 4) + 1)] *= embomag[c];
            car[c].mat[((embodir[c] * 4) + 2)] *= embomag[c];
        }
    }
    for (var i = 0; i < hrepsprks.n; i++) {
        if (hrepsprks.sprkat[i] == fr) {
            sprks(hrepsprks.cn[i], hrepsprks.x[i], hrepsprks.y[i], hrepsprks.z[i], hrepsprks.sx[i], hrepsprks.sy[i], hrepsprks.sz[i], hrepsprks.cap[i]);
        }
    }
    oncheckpoint = hreponcheckpoint[fr];
    onlastcheck = hreponlastcheck[fr];
}
