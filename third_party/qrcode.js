GridSampler = {
    checkAndNudgePoints: function(d, a) {
        for (var c = qrcode.width, b = qrcode.height, e = !0, g = 0; g < a.Length && e; g += 2) {
            var f = Math.floor(a[g]),
                h = Math.floor(a[g + 1]);
            if (-1 > f || f > c || -1 > h || h > b) throw "Error.checkAndNudgePoints ";
            e = !1; - 1 == f ? (a[g] = 0, e = !0) : f == c && (a[g] = c - 1, e = !0); - 1 == h ? (a[g + 1] = 0, e = !0) : h == b && (a[g + 1] = b - 1, e = !0)
        }
        e = !0;
        for (g = a.Length - 2; 0 <= g && e; g -= 2) {
            f = Math.floor(a[g]);
            h = Math.floor(a[g + 1]);
            if (-1 > f || f > c || -1 > h || h > b) throw "Error.checkAndNudgePoints ";
            e = !1; - 1 == f ? (a[g] = 0, e = !0) : f == c && (a[g] = c - 1, e = !0); - 1 == h ? (a[g +
                1] = 0, e = !0) : h == b && (a[g + 1] = b - 1, e = !0)
        }
    },
    sampleGrid3: function(d, a, c) {
        for (var b = new BitMatrix(a), e = Array(a << 1), g = 0; g < a; g++) {
            for (var f = e.length, h = g + 0.5, j = 0; j < f; j += 2) e[j] = (j >> 1) + 0.5, e[j + 1] = h;
            c.transformPoints1(e);
            GridSampler.checkAndNudgePoints(d, e);
            try {
                for (j = 0; j < f; j += 2) {
                    var k = 4 * Math.floor(e[j]) + 4 * Math.floor(e[j + 1]) * qrcode.width,
                        n = d[Math.floor(e[j]) + qrcode.width * Math.floor(e[j + 1])];
                    qrcode.imagedata.data[k] = n ? 255 : 0;
                    qrcode.imagedata.data[k + 1] = n ? 255 : 0;
                    qrcode.imagedata.data[k + 2] = 0;
                    qrcode.imagedata.data[k + 3] =
                        255;
                    n && b.set_Renamed(j >> 1, g)
                }
            } catch (l) {
                throw "Error.checkAndNudgePoints";
            }
        }
        return b
    },
    sampleGridx: function(d, a, c, b, e, g, f, h, j, k, n, l, s, r, m, q, x, y) {
        c = PerspectiveTransform.quadrilateralToQuadrilateral(c, b, e, g, f, h, j, k, n, l, s, r, m, q, x, y);
        return GridSampler.sampleGrid3(d, a, c)
    }
};

function ECB(d, a) {
    this.count = d;
    this.dataCodewords = a;
    this.__defineGetter__("Count", function() {
        return this.count
    });
    this.__defineGetter__("DataCodewords", function() {
        return this.dataCodewords
    })
}

function ECBlocks(d, a, c) {
    this.ecCodewordsPerBlock = d;
    this.ecBlocks = c ? [a, c] : Array(a);
    this.__defineGetter__("ECCodewordsPerBlock", function() {
        return this.ecCodewordsPerBlock
    });
    this.__defineGetter__("TotalECCodewords", function() {
        return this.ecCodewordsPerBlock * this.NumBlocks
    });
    this.__defineGetter__("NumBlocks", function() {
        for (var b = 0, e = 0; e < this.ecBlocks.length; e++) b += this.ecBlocks[e].length;
        return b
    });
    this.getECBlocks = function() {
        return this.ecBlocks
    }
}

function Version(d, a, c, b, e, g) {
    this.versionNumber = d;
    this.alignmentPatternCenters = a;
    this.ecBlocks = [c, b, e, g];
    d = 0;
    a = c.ECCodewordsPerBlock;
    c = c.getECBlocks();
    for (b = 0; b < c.length; b++) e = c[b], d += e.Count * (e.DataCodewords + a);
    this.totalCodewords = d;
    this.__defineGetter__("VersionNumber", function() {
        return this.versionNumber
    });
    this.__defineGetter__("AlignmentPatternCenters", function() {
        return this.alignmentPatternCenters
    });
    this.__defineGetter__("TotalCodewords", function() {
        return this.totalCodewords
    });
    this.__defineGetter__("DimensionForVersion",
        function() {
            return 17 + 4 * this.versionNumber
        });
    this.buildFunctionPattern = function() {
        var e = this.DimensionForVersion,
            b = new BitMatrix(e);
        b.setRegion(0, 0, 9, 9);
        b.setRegion(e - 8, 0, 8, 9);
        b.setRegion(0, e - 8, 9, 8);
        for (var c = this.alignmentPatternCenters.length, a = 0; a < c; a++)
            for (var g = this.alignmentPatternCenters[a] - 2, d = 0; d < c; d++) 0 == a && (0 == d || d == c - 1) || a == c - 1 && 0 == d || b.setRegion(this.alignmentPatternCenters[d] - 2, g, 5, 5);
        b.setRegion(6, 9, 1, e - 17);
        b.setRegion(9, 6, e - 17, 1);
        6 < this.versionNumber && (b.setRegion(e - 11, 0, 3, 6), b.setRegion(0,
            e - 11, 6, 3));
        return b
    };
    this.getECBlocksForLevel = function(b) {
        return this.ecBlocks[b.ordinal()]
    }
}
Version.VERSION_DECODE_INFO = [31892, 34236, 39577, 42195, 48118, 51042, 55367, 58893, 63784, 68472, 70749, 76311, 79154, 84390, 87683, 92361, 96236, 102084, 102881, 110507, 110734, 117786, 119615, 126325, 127568, 133589, 136944, 141498, 145311, 150283, 152622, 158308, 161089, 167017];
Version.VERSIONS = buildVersions();
Version.getVersionForNumber = function(d) {
    if (1 > d || 40 < d) throw "ArgumentException";
    return Version.VERSIONS[d - 1]
};
Version.getProvisionalVersionForDimension = function(d) {
    if (1 != d % 4) throw "Error getProvisionalVersionForDimension";
    try {
        return Version.getVersionForNumber(d - 17 >> 2)
    } catch (a) {
        throw "Error getVersionForNumber";
    }
};
Version.decodeVersionInformation = function(d) {
    for (var a = 4294967295, c = 0, b = 0; b < Version.VERSION_DECODE_INFO.length; b++) {
        var e = Version.VERSION_DECODE_INFO[b];
        if (e == d) return this.getVersionForNumber(b + 7);
        e = FormatInformation.numBitsDiffering(d, e);
        e < a && (c = b + 7, a = e)
    }
    return 3 >= a ? this.getVersionForNumber(c) : null
};

function buildVersions() {
    return [new Version(1, [], new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))), new Version(2, [6, 18], new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))), new Version(3, [6, 22], new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))), new Version(4, [6, 26], new ECBlocks(20,
            new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))), new Version(5, [6, 30], new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))), new Version(6, [6, 34], new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))), new Version(7, [6, 22, 38], new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4,
            31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))), new Version(8, [6, 24, 42], new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))), new Version(9, [6, 26, 46], new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))), new Version(10, [6, 28, 50],
            new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))), new Version(11, [6, 30, 54], new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))), new Version(12, [6, 32, 58], new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26,
            new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))), new Version(13, [6, 34, 62], new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))), new Version(14, [6, 26, 46, 66], new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))), new Version(15, [6, 26,
            48, 70
        ], new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))), new Version(16, [6, 26, 50, 74], new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))), new Version(17, [6, 30, 54, 78], new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10,
            46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))), new Version(18, [6, 30, 56, 82], new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))), new Version(19, [6, 30, 58, 86], new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26,
            new ECB(9, 13), new ECB(16, 14))), new Version(20, [6, 34, 62, 90], new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))), new Version(21, [6, 28, 50, 72, 94], new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))), new Version(22, [6, 26, 50, 74, 98], new ECBlocks(28, new ECB(2,
            111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))), new Version(23, [6, 30, 54, 74, 102], new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))), new Version(24, [6, 28, 54, 80, 106], new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11,
            24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))), new Version(25, [6, 32, 58, 84, 110], new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))), new Version(26, [6, 30, 58, 86, 114], new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))),
        new Version(27, [6, 34, 62, 90, 118], new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))), new Version(28, [6, 26, 50, 74, 98, 122], new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))), new Version(29, [6, 30, 54, 78, 102, 126], new ECBlocks(30, new ECB(7,
            116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))), new Version(30, [6, 26, 52, 78, 104, 130], new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))), new Version(31, [6, 30, 56, 82, 108, 134], new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46),
            new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))), new Version(32, [6, 34, 60, 86, 112, 138], new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))), new Version(33, [6, 30, 58, 86, 114, 142], new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30,
            new ECB(11, 15), new ECB(46, 16))), new Version(34, [6, 34, 62, 90, 118, 146], new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))), new Version(35, [6, 30, 54, 78, 102, 126, 150], new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))), new Version(36, [6, 24, 50, 76, 102, 128, 154], new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))), new Version(37, [6, 28, 54, 80, 106, 132, 158], new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))), new Version(38, [6, 32, 58, 84, 110, 136, 162], new ECBlocks(30, new ECB(4,
            122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))), new Version(39, [6, 26, 54, 82, 110, 138, 166], new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))), new Version(40, [6, 30, 58, 86, 114, 142, 170], new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18,
            47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16)))
    ]
}

function PerspectiveTransform(d, a, c, b, e, g, f, h, j) {
    this.a11 = d;
    this.a12 = b;
    this.a13 = f;
    this.a21 = a;
    this.a22 = e;
    this.a23 = h;
    this.a31 = c;
    this.a32 = g;
    this.a33 = j;
    this.transformPoints1 = function(b) {
        for (var e = b.length, c = this.a11, a = this.a12, g = this.a13, d = this.a21, f = this.a22, h = this.a23, j = this.a31, z = this.a32, A = this.a33, t = 0; t < e; t += 2) {
            var u = b[t],
                v = b[t + 1],
                w = g * u + h * v + A;
            b[t] = (c * u + d * v + j) / w;
            b[t + 1] = (a * u + f * v + z) / w
        }
    };
    this.transformPoints2 = function(b, e) {
        for (var c = b.length, a = 0; a < c; a++) {
            var g = b[a],
                d = e[a],
                f = this.a13 * g + this.a23 * d + this.a33;
            b[a] = (this.a11 * g + this.a21 * d + this.a31) / f;
            e[a] = (this.a12 * g + this.a22 * d + this.a32) / f
        }
    };
    this.buildAdjoint = function() {
        return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21)
    };
    this.times = function(b) {
        return new PerspectiveTransform(this.a11 *
            b.a11 + this.a21 * b.a12 + this.a31 * b.a13, this.a11 * b.a21 + this.a21 * b.a22 + this.a31 * b.a23, this.a11 * b.a31 + this.a21 * b.a32 + this.a31 * b.a33, this.a12 * b.a11 + this.a22 * b.a12 + this.a32 * b.a13, this.a12 * b.a21 + this.a22 * b.a22 + this.a32 * b.a23, this.a12 * b.a31 + this.a22 * b.a32 + this.a32 * b.a33, this.a13 * b.a11 + this.a23 * b.a12 + this.a33 * b.a13, this.a13 * b.a21 + this.a23 * b.a22 + this.a33 * b.a23, this.a13 * b.a31 + this.a23 * b.a32 + this.a33 * b.a33)
    }
}
PerspectiveTransform.quadrilateralToQuadrilateral = function(d, a, c, b, e, g, f, h, j, k, n, l, s, r, m, q) {
    d = this.quadrilateralToSquare(d, a, c, b, e, g, f, h);
    return this.squareToQuadrilateral(j, k, n, l, s, r, m, q).times(d)
};
PerspectiveTransform.squareToQuadrilateral = function(d, a, c, b, e, g, f, h) {
    dy2 = h - g;
    dy3 = a - b + g - h;
    if (0 == dy2 && 0 == dy3) return new PerspectiveTransform(c - d, e - c, d, b - a, g - b, a, 0, 0, 1);
    dx1 = c - e;
    dx2 = f - e;
    dx3 = d - c + e - f;
    dy1 = b - g;
    denominator = dx1 * dy2 - dx2 * dy1;
    a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
    a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
    return new PerspectiveTransform(c - d + a13 * c, f - d + a23 * f, d, b - a + a13 * b, h - a + a23 * h, a, a13, a23, 1)
};
PerspectiveTransform.quadrilateralToSquare = function(d, a, c, b, e, g, f, h) {
    return this.squareToQuadrilateral(d, a, c, b, e, g, f, h).buildAdjoint()
};

function DetectorResult(d, a) {
    this.bits = d;
    this.points = a
}

function Detector(d) {
    this.image = d;
    this.resultPointCallback = null;
    this.sizeOfBlackWhiteBlackRun = function(a, c, b, e) {
        var g = Math.abs(e - c) > Math.abs(b - a);
        if (g) {
            var d = a;
            a = c;
            c = d;
            d = b;
            b = e;
            e = d
        }
        for (var h = Math.abs(b - a), j = Math.abs(e - c), k = -h >> 1, n = c < e ? 1 : -1, l = a < b ? 1 : -1, s = 0, r = a, d = c; r != b; r += l) {
            var m = g ? d : r,
                q = g ? r : d;
            1 == s ? this.image[m + q * qrcode.width] && s++ : this.image[m + q * qrcode.width] || s++;
            if (3 == s) return e = r - a, c = d - c, Math.sqrt(e * e + c * c);
            k += j;
            if (0 < k) {
                if (d == e) break;
                d += n;
                k -= h
            }
        }
        a = b - a;
        c = e - c;
        return Math.sqrt(a * a + c * c)
    };
    this.sizeOfBlackWhiteBlackRunBothWays =
        function(a, c, b, e) {
            var g = this.sizeOfBlackWhiteBlackRun(a, c, b, e),
                d = 1;
            b = a - (b - a);
            0 > b ? (d = a / (a - b), b = 0) : b >= qrcode.width && (d = (qrcode.width - 1 - a) / (b - a), b = qrcode.width - 1);
            e = Math.floor(c - (e - c) * d);
            d = 1;
            0 > e ? (d = c / (c - e), e = 0) : e >= qrcode.height && (d = (qrcode.height - 1 - c) / (e - c), e = qrcode.height - 1);
            b = Math.floor(a + (b - a) * d);
            g += this.sizeOfBlackWhiteBlackRun(a, c, b, e);
            return g - 1
        };
    this.calculateModuleSizeOneWay = function(a, c) {
        var b = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(a.X), Math.floor(a.Y), Math.floor(c.X), Math.floor(c.Y)),
            e = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(c.X), Math.floor(c.Y), Math.floor(a.X), Math.floor(a.Y));
        return isNaN(b) ? e / 7 : isNaN(e) ? b / 7 : (b + e) / 14
    };
    this.calculateModuleSize = function(a, c, b) {
        return (this.calculateModuleSizeOneWay(a, c) + this.calculateModuleSizeOneWay(a, b)) / 2
    };
    this.distance = function(a, c) {
        xDiff = a.X - c.X;
        yDiff = a.Y - c.Y;
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
    };
    this.computeDimension = function(a, c, b, e) {
        c = Math.round(this.distance(a, c) / e);
        a = Math.round(this.distance(a, b) / e);
        a = (c + a >> 1) + 7;
        switch (a &
            3) {
            case 0:
                a++;
                break;
            case 2:
                a--;
                break;
            case 3:
                throw "Error";
        }
        return a
    };
    this.findAlignmentInRegion = function(a, c, b, e) {
        var g = Math.floor(e * a);
        e = Math.max(0, c - g);
        c = Math.min(qrcode.width - 1, c + g);
        if (c - e < 3 * a) throw "Error";
        var d = Math.max(0, b - g);
        b = Math.min(qrcode.height - 1, b + g);
        return (new AlignmentPatternFinder(this.image, e, d, c - e, b - d, a, this.resultPointCallback)).find()
    };
    this.createTransform = function(a, c, b, e, d) {
        d -= 3.5;
        var f, h, j;
        null != e ? (f = e.X, e = e.Y, h = j = d - 3) : (f = c.X - a.X + b.X, e = c.Y - a.Y + b.Y, h = j = d);
        return PerspectiveTransform.quadrilateralToQuadrilateral(3.5,
            3.5, d, 3.5, h, j, 3.5, d, a.X, a.Y, c.X, c.Y, f, e, b.X, b.Y)
    };
    this.sampleGrid = function(a, c, b) {
        return GridSampler.sampleGrid3(a, b, c)
    };
    this.processFinderPatternInfo = function(a) {
        var c = a.TopLeft,
            b = a.TopRight;
        a = a.BottomLeft;
        var e = this.calculateModuleSize(c, b, a);
        if (1 > e) throw "Error";
        var d = this.computeDimension(c, b, a, e),
            f = Version.getProvisionalVersionForDimension(d),
            h = f.DimensionForVersion - 7,
            j = null;
        if (0 < f.AlignmentPatternCenters.length) {
            h = 1 - 3 / h;
            f = Math.floor(c.X + h * (b.X - c.X + a.X - c.X));
            for (h = Math.floor(c.Y + h * (b.Y - c.Y + a.Y -
                    c.Y));;) {
                j = this.findAlignmentInRegion(e, f, h, 4);
                break
            }
        }
        e = this.createTransform(c, b, a, j, d);
        d = this.sampleGrid(this.image, e, d);
        return new DetectorResult(d, null == j ? [a, c, b] : [a, c, b, j])
    };
    this.detect = function() {
        var a = (new FinderPatternFinder).findFinderPattern(this.image);
        return this.processFinderPatternInfo(a)
    }
}
var FORMAT_INFO_MASK_QR = 21522,
    FORMAT_INFO_DECODE_LOOKUP = [
        [21522, 0],
        [20773, 1],
        [24188, 2],
        [23371, 3],
        [17913, 4],
        [16590, 5],
        [20375, 6],
        [19104, 7],
        [30660, 8],
        [29427, 9],
        [32170, 10],
        [30877, 11],
        [26159, 12],
        [25368, 13],
        [27713, 14],
        [26998, 15],
        [5769, 16],
        [5054, 17],
        [7399, 18],
        [6608, 19],
        [1890, 20],
        [597, 21],
        [3340, 22],
        [2107, 23],
        [13663, 24],
        [12392, 25],
        [16177, 26],
        [14854, 27],
        [9396, 28],
        [8579, 29],
        [11994, 30],
        [11245, 31]
    ],
    BITS_SET_IN_HALF_BYTE = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];

function FormatInformation(d) {
    this.errorCorrectionLevel = ErrorCorrectionLevel.forBits(d >> 3 & 3);
    this.dataMask = d & 7;
    this.__defineGetter__("ErrorCorrectionLevel", function() {
        return this.errorCorrectionLevel
    });
    this.__defineGetter__("DataMask", function() {
        return this.dataMask
    });
    this.GetHashCode = function() {
        return this.errorCorrectionLevel.ordinal() << 3 | dataMask
    };
    this.Equals = function(a) {
        return this.errorCorrectionLevel == a.errorCorrectionLevel && this.dataMask == a.dataMask
    }
}
FormatInformation.numBitsDiffering = function(d, a) {
    d ^= a;
    return BITS_SET_IN_HALF_BYTE[d & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 4) & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 8) & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 12) & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 16) & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 20) & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 24) & 15] + BITS_SET_IN_HALF_BYTE[URShift(d, 28) & 15]
};
FormatInformation.decodeFormatInformation = function(d) {
    var a = FormatInformation.doDecodeFormatInformation(d);
    return null != a ? a : FormatInformation.doDecodeFormatInformation(d ^ FORMAT_INFO_MASK_QR)
};
FormatInformation.doDecodeFormatInformation = function(d) {
    for (var a = 4294967295, c = 0, b = 0; b < FORMAT_INFO_DECODE_LOOKUP.length; b++) {
        var e = FORMAT_INFO_DECODE_LOOKUP[b],
            g = e[0];
        if (g == d) return new FormatInformation(e[1]);
        g = this.numBitsDiffering(d, g);
        g < a && (c = e[1], a = g)
    }
    return 3 >= a ? new FormatInformation(c) : null
};

function ErrorCorrectionLevel(d, a, c) {
    this.ordinal_Renamed_Field = d;
    this.bits = a;
    this.name = c;
    this.__defineGetter__("Bits", function() {
        return this.bits
    });
    this.__defineGetter__("Name", function() {
        return this.name
    });
    this.ordinal = function() {
        return this.ordinal_Renamed_Field
    }
}
ErrorCorrectionLevel.forBits = function(d) {
    if (0 > d || d >= FOR_BITS.Length) throw "ArgumentException";
    return FOR_BITS[d]
};
var L = new ErrorCorrectionLevel(0, 1, "L"),
    M = new ErrorCorrectionLevel(1, 0, "M"),
    Q = new ErrorCorrectionLevel(2, 3, "Q"),
    H = new ErrorCorrectionLevel(3, 2, "H"),
    FOR_BITS = [M, L, H, Q];

function BitMatrix(d, a) {
    a || (a = d);
    if (1 > d || 1 > a) throw "Both dimensions must be greater than 0";
    this.width = d;
    this.height = a;
    var c = d >> 5;
    0 != (d & 31) && c++;
    this.rowSize = c;
    this.bits = Array(c * a);
    for (c = 0; c < this.bits.length; c++) this.bits[c] = 0;
    this.__defineGetter__("Width", function() {
        return this.width
    });
    this.__defineGetter__("Height", function() {
        return this.height
    });
    this.__defineGetter__("Dimension", function() {
        if (this.width != this.height) throw "Can't call getDimension() on a non-square matrix";
        return this.width
    });
    this.get_Renamed =
        function(b, e) {
            return 0 != (URShift(this.bits[e * this.rowSize + (b >> 5)], b & 31) & 1)
        };
    this.set_Renamed = function(b, e) {
        this.bits[e * this.rowSize + (b >> 5)] |= 1 << (b & 31)
    };
    this.flip = function(b, e) {
        this.bits[e * this.rowSize + (b >> 5)] ^= 1 << (b & 31)
    };
    this.clear = function() {
        for (var b = this.bits.length, e = 0; e < b; e++) this.bits[e] = 0
    };
    this.setRegion = function(b, e, c, a) {
        if (0 > e || 0 > b) throw "Left and top must be nonnegative";
        if (1 > a || 1 > c) throw "Height and width must be at least 1";
        c = b + c;
        a = e + a;
        if (a > this.height || c > this.width) throw "The region must fit inside the matrix";
        for (; e < a; e++)
            for (var d = e * this.rowSize, j = b; j < c; j++) this.bits[d + (j >> 5)] |= 1 << (j & 31)
    }
}

function DataBlock(d, a) {
    this.numDataCodewords = d;
    this.codewords = a;
    this.__defineGetter__("NumDataCodewords", function() {
        return this.numDataCodewords
    });
    this.__defineGetter__("Codewords", function() {
        return this.codewords
    })
}
DataBlock.getDataBlocks = function(d, a, c) {
    if (d.length != a.TotalCodewords) throw "ArgumentException";
    var b = a.getECBlocksForLevel(c);
    c = 0;
    var e = b.getECBlocks();
    for (a = 0; a < e.length; a++) c += e[a].Count;
    c = Array(c);
    for (var g = 0, f = 0; f < e.length; f++) {
        var h = e[f];
        for (a = 0; a < h.Count; a++) {
            var j = h.DataCodewords,
                k = b.ECCodewordsPerBlock + j;
            c[g++] = new DataBlock(j, Array(k))
        }
    }
    a = c[0].codewords.length;
    for (e = c.length - 1; 0 <= e && c[e].codewords.length != a;) e--;
    e++;
    b = a - b.ECCodewordsPerBlock;
    for (a = h = 0; a < b; a++)
        for (f = 0; f < g; f++) c[f].codewords[a] =
            d[h++];
    for (f = e; f < g; f++) c[f].codewords[b] = d[h++];
    j = c[0].codewords.length;
    for (a = b; a < j; a++)
        for (f = 0; f < g; f++) c[f].codewords[f < e ? a : a + 1] = d[h++];
    return c
};

function BitMatrixParser(d) {
    var a = d.Dimension;
    if (21 > a || 1 != (a & 3)) throw "Error BitMatrixParser";
    this.bitMatrix = d;
    this.parsedFormatInfo = this.parsedVersion = null;
    this.copyBit = function(c, b, e) {
        return this.bitMatrix.get_Renamed(c, b) ? e << 1 | 1 : e << 1
    };
    this.readFormatInformation = function() {
        if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
        for (var c = 0, b = 0; 6 > b; b++) c = this.copyBit(b, 8, c);
        c = this.copyBit(7, 8, c);
        c = this.copyBit(8, 8, c);
        c = this.copyBit(8, 7, c);
        for (b = 5; 0 <= b; b--) c = this.copyBit(8, b, c);
        this.parsedFormatInfo =
            FormatInformation.decodeFormatInformation(c);
        if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
        for (var e = this.bitMatrix.Dimension, c = 0, a = e - 8, b = e - 1; b >= a; b--) c = this.copyBit(b, 8, c);
        for (b = e - 7; b < e; b++) c = this.copyBit(8, b, c);
        this.parsedFormatInfo = FormatInformation.decodeFormatInformation(c);
        if (null != this.parsedFormatInfo) return this.parsedFormatInfo;
        throw "Error readFormatInformation";
    };
    this.readVersion = function() {
        if (null != this.parsedVersion) return this.parsedVersion;
        var c = this.bitMatrix.Dimension,
            b = c - 17 >> 2;
        if (6 >= b) return Version.getVersionForNumber(b);
        for (var b = 0, e = c - 11, a = 5; 0 <= a; a--)
            for (var d = c - 9; d >= e; d--) b = this.copyBit(d, a, b);
        this.parsedVersion = Version.decodeVersionInformation(b);
        if (null != this.parsedVersion && this.parsedVersion.DimensionForVersion == c) return this.parsedVersion;
        b = 0;
        for (d = 5; 0 <= d; d--)
            for (a = c - 9; a >= e; a--) b = this.copyBit(d, a, b);
        this.parsedVersion = Version.decodeVersionInformation(b);
        if (null != this.parsedVersion && this.parsedVersion.DimensionForVersion == c) return this.parsedVersion;
        throw "Error readVersion";
    };
    this.readCodewords = function() {
        var c = this.readFormatInformation(),
            b = this.readVersion(),
            e = DataMask.forReference(c.DataMask),
            c = this.bitMatrix.Dimension;
        e.unmaskBitMatrix(this.bitMatrix, c);
        for (var e = b.buildFunctionPattern(), a = !0, d = Array(b.TotalCodewords), h = 0, j = 0, k = 0, n = c - 1; 0 < n; n -= 2) {
            6 == n && n--;
            for (var l = 0; l < c; l++)
                for (var s = a ? c - 1 - l : l, r = 0; 2 > r; r++) e.get_Renamed(n - r, s) || (k++, j <<= 1, this.bitMatrix.get_Renamed(n - r, s) && (j |= 1), 8 == k && (d[h++] = j, j = k = 0));
            a ^= 1
        }
        if (h != b.TotalCodewords) throw "Error readCodewords";
        return d
    }
}
DataMask = {
    forReference: function(d) {
        if (0 > d || 7 < d) throw "System.ArgumentException";
        return DataMask.DATA_MASKS[d]
    }
};

function DataMask000() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        return 0 == (d + a & 1)
    }
}

function DataMask001() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d) {
        return 0 == (d & 1)
    }
}

function DataMask010() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        return 0 == a % 3
    }
}

function DataMask011() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        return 0 == (d + a) % 3
    }
}

function DataMask100() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        return 0 == (URShift(d, 1) + a / 3 & 1)
    }
}

function DataMask101() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        var c = d * a;
        return 0 == (c & 1) + c % 3
    }
}

function DataMask110() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        var c = d * a;
        return 0 == ((c & 1) + c % 3 & 1)
    }
}

function DataMask111() {
    this.unmaskBitMatrix = function(d, a) {
        for (var c = 0; c < a; c++)
            for (var b = 0; b < a; b++) this.isMasked(c, b) && d.flip(b, c)
    };
    this.isMasked = function(d, a) {
        return 0 == ((d + a & 1) + d * a % 3 & 1)
    }
}
DataMask.DATA_MASKS = [new DataMask000, new DataMask001, new DataMask010, new DataMask011, new DataMask100, new DataMask101, new DataMask110, new DataMask111];

function ReedSolomonDecoder(d) {
    this.field = d;
    this.decode = function(a, c) {
        for (var b = new GF256Poly(this.field, a), e = Array(c), d = 0; d < e.length; d++) e[d] = 0;
        for (var f = !0, d = 0; d < c; d++) {
            var h = b.evaluateAt(this.field.exp(d));
            e[e.length - 1 - d] = h;
            0 != h && (f = !1)
        }
        if (!f) {
            d = new GF256Poly(this.field, e);
            b = this.runEuclideanAlgorithm(this.field.buildMonomial(c, 1), d, c);
            d = b[1];
            b = this.findErrorLocations(b[0]);
            e = this.findErrorMagnitudes(d, b, !1);
            for (d = 0; d < b.length; d++) {
                f = a.length - 1 - this.field.log(b[d]);
                if (0 > f) throw "ReedSolomonException Bad error location";
                a[f] = GF256.addOrSubtract(a[f], e[d])
            }
        }
    };
    this.runEuclideanAlgorithm = function(a, c, b) {
        if (a.Degree < c.Degree) {
            var e = a;
            a = c;
            c = e
        }
        for (var e = this.field.One, d = this.field.Zero, f = this.field.Zero, h = this.field.One; c.Degree >= Math.floor(b / 2);) {
            var j = a,
                k = e,
                n = f;
            a = c;
            e = d;
            f = h;
            if (a.Zero) throw "r_{i-1} was zero";
            c = j;
            h = this.field.Zero;
            d = a.getCoefficient(a.Degree);
            for (d = this.field.inverse(d); c.Degree >= a.Degree && !c.Zero;) {
                var j = c.Degree - a.Degree,
                    l = this.field.multiply(c.getCoefficient(c.Degree), d),
                    h = h.addOrSubtract(this.field.buildMonomial(j,
                        l));
                c = c.addOrSubtract(a.multiplyByMonomial(j, l))
            }
            d = h.multiply1(e).addOrSubtract(k);
            h = h.multiply1(f).addOrSubtract(n)
        }
        b = h.getCoefficient(0);
        if (0 == b) throw "ReedSolomonException sigmaTilde(0) was zero";
        b = this.field.inverse(b);
        a = h.multiply2(b);
        b = c.multiply2(b);
        return [a, b]
    };
    this.findErrorLocations = function(a) {
        var c = a.Degree;
        if (1 == c) return Array(a.getCoefficient(1));
        for (var b = Array(c), e = 0, d = 1; 256 > d && e < c; d++) 0 == a.evaluateAt(d) && (b[e] = this.field.inverse(d), e++);
        if (e != c) throw "Error locator degree does not match number of roots";
        return b
    };
    this.findErrorMagnitudes = function(a, c, b) {
        for (var e = c.length, d = Array(e), f = 0; f < e; f++) {
            for (var h = this.field.inverse(c[f]), j = 1, k = 0; k < e; k++) f != k && (j = this.field.multiply(j, GF256.addOrSubtract(1, this.field.multiply(c[k], h))));
            d[f] = this.field.multiply(a.evaluateAt(h), this.field.inverse(j));
            b && (d[f] = this.field.multiply(d[f], h))
        }
        return d
    }
}

function GF256Poly(d, a) {
    if (null == a || 0 == a.length) throw "System.ArgumentException";
    this.field = d;
    var c = a.length;
    if (1 < c && 0 == a[0]) {
        for (var b = 1; b < c && 0 == a[b];) b++;
        if (b == c) this.coefficients = d.Zero.coefficients;
        else {
            this.coefficients = Array(c - b);
            for (c = 0; c < this.coefficients.length; c++) this.coefficients[c] = 0;
            for (c = 0; c < this.coefficients.length; c++) this.coefficients[c] = a[b + c]
        }
    } else this.coefficients = a;
    this.__defineGetter__("Zero", function() {
        return 0 == this.coefficients[0]
    });
    this.__defineGetter__("Degree", function() {
        return this.coefficients.length -
            1
    });
    this.__defineGetter__("Coefficients", function() {
        return this.coefficients
    });
    this.getCoefficient = function(b) {
        return this.coefficients[this.coefficients.length - 1 - b]
    };
    this.evaluateAt = function(b) {
        if (0 == b) return this.getCoefficient(0);
        var c = this.coefficients.length;
        if (1 == b) {
            for (var a = b = 0; a < c; a++) b = GF256.addOrSubtract(b, this.coefficients[a]);
            return b
        }
        for (var d = this.coefficients[0], a = 1; a < c; a++) d = GF256.addOrSubtract(this.field.multiply(b, d), this.coefficients[a]);
        return d
    };
    this.addOrSubtract = function(b) {
        if (this.field !=
            b.field) throw "GF256Polys do not have same GF256 field";
        if (this.Zero) return b;
        if (b.Zero) return this;
        var a = this.coefficients;
        b = b.coefficients;
        if (a.length > b.length) {
            var c = a,
                a = b;
            b = c
        }
        for (var c = Array(b.length), h = b.length - a.length, j = 0; j < h; j++) c[j] = b[j];
        for (j = h; j < b.length; j++) c[j] = GF256.addOrSubtract(a[j - h], b[j]);
        return new GF256Poly(d, c)
    };
    this.multiply1 = function(b) {
        if (this.field != b.field) throw "GF256Polys do not have same GF256 field";
        if (this.Zero || b.Zero) return this.field.Zero;
        var a = this.coefficients,
            c =
            a.length;
        b = b.coefficients;
        for (var d = b.length, j = Array(c + d - 1), k = 0; k < c; k++)
            for (var n = a[k], l = 0; l < d; l++) j[k + l] = GF256.addOrSubtract(j[k + l], this.field.multiply(n, b[l]));
        return new GF256Poly(this.field, j)
    };
    this.multiply2 = function(b) {
        if (0 == b) return this.field.Zero;
        if (1 == b) return this;
        for (var a = this.coefficients.length, c = Array(a), d = 0; d < a; d++) c[d] = this.field.multiply(this.coefficients[d], b);
        return new GF256Poly(this.field, c)
    };
    this.multiplyByMonomial = function(b, a) {
        if (0 > b) throw "System.ArgumentException";
        if (0 ==
            a) return this.field.Zero;
        for (var c = this.coefficients.length, d = Array(c + b), j = 0; j < d.length; j++) d[j] = 0;
        for (j = 0; j < c; j++) d[j] = this.field.multiply(this.coefficients[j], a);
        return new GF256Poly(this.field, d)
    };
    this.divide = function(b) {
        if (this.field != b.field) throw "GF256Polys do not have same GF256 field";
        if (b.Zero) throw "Divide by 0";
        for (var a = this.field.Zero, c = this, d = b.getCoefficient(b.Degree), d = this.field.inverse(d); c.Degree >= b.Degree && !c.Zero;) var j = c.Degree - b.Degree,
            k = this.field.multiply(c.getCoefficient(c.Degree),
                d),
            n = b.multiplyByMonomial(j, k),
            j = this.field.buildMonomial(j, k),
            a = a.addOrSubtract(j),
            c = c.addOrSubtract(n);
        return [a, c]
    }
}

function GF256(d) {
    this.expTable = Array(256);
    this.logTable = Array(256);
    for (var a = 1, c = 0; 256 > c; c++) this.expTable[c] = a, a <<= 1, 256 <= a && (a ^= d);
    for (c = 0; 255 > c; c++) this.logTable[this.expTable[c]] = c;
    d = Array(1);
    d[0] = 0;
    this.zero = new GF256Poly(this, Array(d));
    d = Array(1);
    d[0] = 1;
    this.one = new GF256Poly(this, Array(d));
    this.__defineGetter__("Zero", function() {
        return this.zero
    });
    this.__defineGetter__("One", function() {
        return this.one
    });
    this.buildMonomial = function(b, c) {
        if (0 > b) throw "System.ArgumentException";
        if (0 == c) return zero;
        for (var a = Array(b + 1), d = 0; d < a.length; d++) a[d] = 0;
        a[0] = c;
        return new GF256Poly(this, a)
    };
    this.exp = function(b) {
        return this.expTable[b]
    };
    this.log = function(b) {
        if (0 == b) throw "System.ArgumentException";
        return this.logTable[b]
    };
    this.inverse = function(b) {
        if (0 == b) throw "System.ArithmeticException";
        return this.expTable[255 - this.logTable[b]]
    };
    this.multiply = function(b, a) {
        return 0 == b || 0 == a ? 0 : 1 == b ? a : 1 == a ? b : this.expTable[(this.logTable[b] + this.logTable[a]) % 255]
    }
}
GF256.QR_CODE_FIELD = new GF256(285);
GF256.DATA_MATRIX_FIELD = new GF256(301);
GF256.addOrSubtract = function(d, a) {
    return d ^ a
};
Decoder = {};
Decoder.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);
Decoder.correctErrors = function(d, a) {
    for (var c = d.length, b = Array(c), e = 0; e < c; e++) b[e] = d[e] & 255;
    c = d.length - a;
    try {
        Decoder.rsDecoder.decode(b, c)
    } catch (g) {
        throw g;
    }
    for (e = 0; e < a; e++) d[e] = b[e]
};
Decoder.decode = function(d) {
    var a = new BitMatrixParser(d);
    d = a.readVersion();
    for (var c = a.readFormatInformation().ErrorCorrectionLevel, a = a.readCodewords(), a = DataBlock.getDataBlocks(a, d, c), b = 0, e = 0; e < a.Length; e++) b += a[e].NumDataCodewords;
    for (var b = Array(b), g = 0, f = 0; f < a.length; f++) {
        var e = a[f],
            h = e.Codewords,
            j = e.NumDataCodewords;
        Decoder.correctErrors(h, j);
        for (e = 0; e < j; e++) b[g++] = h[e]
    }
    return new QRCodeDataBlockReader(b, d.VersionNumber, c.Bits)
};
qrcode = {
    imagedata: null,
    width: 0,
    height: 0,
    qrCodeSymbol: null,
    debug: !1,
    sizeOfDataLengthInfo: [
        [10, 9, 8, 8],
        [12, 11, 16, 10],
        [14, 13, 16, 12]
    ],
    callback: null,
    decode: function(d) {
        if (0 == arguments.length) {
            var a = document.getElementById("qr-canvas"),
                c = a.getContext("2d");
            qrcode.width = a.width;
            qrcode.height = a.height;
            qrcode.imagedata = c.getImageData(0, 0, qrcode.width, qrcode.height);
            qrcode.result = qrcode.process(c);
            null != qrcode.callback && qrcode.callback(qrcode.result);
            return qrcode.result
        }
        var b = new Image;
        b.onload = function() {
            var a =
                document.createElement("canvas"),
                c = a.getContext("2d"),
                d = document.getElementById("out-canvas");
            null != d && (d = d.getContext("2d"), d.clearRect(0, 0, 320, 240), d.drawImage(b, 0, 0, 320, 240));
            a.width = b.width;
            a.height = b.height;
            c.drawImage(b, 0, 0);
            qrcode.width = b.width;
            qrcode.height = b.height;
            try {
                qrcode.imagedata = c.getImageData(0, 0, b.width, b.height)
            } catch (h) {
                qrcode.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
                null != qrcode.callback && qrcode.callback(qrcode.result);
                return
            }
            try {
                qrcode.result = qrcode.process(c)
            } catch (j) {
                console.log(j), qrcode.result = "error decoding QR Code"
            }
            null != qrcode.callback && qrcode.callback(qrcode.result)
        };
        b.src = d
    },
    decode_utf8: function(d) {
        return decodeURIComponent(escape(d))
    },
    process: function(d) {
        var a = (new Date).getTime(),
            c = qrcode.grayScaleToBitmap(qrcode.grayscale());
        if (qrcode.debug) {
            for (var b = 0; b < qrcode.height; b++)
                for (var e = 0; e < qrcode.width; e++) {
                    var g = 4 * e + 4 * b * qrcode.width;
                    qrcode.imagedata.data[g] = 0;
                    qrcode.imagedata.data[g + 1] = 0;
                    qrcode.imagedata.data[g +
                        2] = c[e + b * qrcode.width] ? 255 : 0
                }
            d.putImageData(qrcode.imagedata, 0, 0)
        }
        c = (new Detector(c)).detect();
        qrcode.debug && d.putImageData(qrcode.imagedata, 0, 0);
        c = Decoder.decode(c.bits).DataByte;
        d = "";
        for (b = 0; b < c.length; b++)
            for (e = 0; e < c[b].length; e++) d += String.fromCharCode(c[b][e]);
        a = (new Date).getTime() - a;
        console.log(a);
        return qrcode.decode_utf8(d)
    },
    getPixel: function(d, a) {
        if (qrcode.width < d) throw "point error";
        if (qrcode.height < a) throw "point error";
        point = 4 * d + 4 * a * qrcode.width;
        return p = (33 * qrcode.imagedata.data[point] +
            34 * qrcode.imagedata.data[point + 1] + 33 * qrcode.imagedata.data[point + 2]) / 100
    },
    binarize: function(d) {
        for (var a = Array(qrcode.width * qrcode.height), c = 0; c < qrcode.height; c++)
            for (var b = 0; b < qrcode.width; b++) {
                var e = qrcode.getPixel(b, c);
                a[b + c * qrcode.width] = e <= d ? !0 : !1
            }
        return a
    },
    getMiddleBrightnessPerArea: function(d) {
        for (var a = Math.floor(qrcode.width / 4), c = Math.floor(qrcode.height / 4), b = Array(4), e = 0; 4 > e; e++) {
            b[e] = Array(4);
            for (var g = 0; 4 > g; g++) b[e][g] = [0, 0]
        }
        for (e = 0; 4 > e; e++)
            for (g = 0; 4 > g; g++) {
                b[g][e][0] = 255;
                for (var f = 0; f <
                    c; f++)
                    for (var h = 0; h < a; h++) {
                        var j = d[a * g + h + (c * e + f) * qrcode.width];
                        j < b[g][e][0] && (b[g][e][0] = j);
                        j > b[g][e][1] && (b[g][e][1] = j)
                    }
            }
        d = Array(4);
        for (a = 0; 4 > a; a++) d[a] = Array(4);
        for (e = 0; 4 > e; e++)
            for (g = 0; 4 > g; g++) d[g][e] = Math.floor((b[g][e][0] + b[g][e][1]) / 2);
        return d
    },
    grayScaleToBitmap: function(d) {
        for (var a = qrcode.getMiddleBrightnessPerArea(d), c = a.length, b = Math.floor(qrcode.width / c), e = Math.floor(qrcode.height / c), g = Array(qrcode.height * qrcode.width), f = 0; f < c; f++)
            for (var h = 0; h < c; h++)
                for (var j = 0; j < e; j++)
                    for (var k = 0; k < b; k++) g[b *
                        h + k + (e * f + j) * qrcode.width] = d[b * h + k + (e * f + j) * qrcode.width] < a[h][f] ? !0 : !1;
        return g
    },
    grayscale: function() {
        for (var d = Array(qrcode.width * qrcode.height), a = 0; a < qrcode.height; a++)
            for (var c = 0; c < qrcode.width; c++) {
                var b = qrcode.getPixel(c, a);
                d[c + a * qrcode.width] = b
            }
        return d
    }
};

function URShift(d, a) {
    return 0 <= d ? d >> a : (d >> a) + (2 << ~a)
}
Array.prototype.remove = function(d, a) {
    var c = this.slice((a || d) + 1 || this.length);
    this.length = 0 > d ? this.length + d : d;
    return this.push.apply(this, c)
};
var MIN_SKIP = 3,
    MAX_MODULES = 57,
    INTEGER_MATH_SHIFT = 8,
    CENTER_QUORUM = 2;
qrcode.orderBestPatterns = function(d) {
    function a(b, a) {
        xDiff = b.X - a.X;
        yDiff = b.Y - a.Y;
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
    }
    var c = a(d[0], d[1]),
        b = a(d[1], d[2]),
        e = a(d[0], d[2]);
    b >= c && b >= e ? (b = d[0], c = d[1], e = d[2]) : e >= b && e >= c ? (b = d[1], c = d[0], e = d[2]) : (b = d[2], c = d[0], e = d[1]);
    var g = b.x,
        f = b.y;
    0 > (e.x - g) * (c.y - f) - (e.y - f) * (c.x - g) && (g = c, c = e, e = g);
    d[0] = c;
    d[1] = b;
    d[2] = e
};

function FinderPattern(d, a, c) {
    this.x = d;
    this.y = a;
    this.count = 1;
    this.estimatedModuleSize = c;
    this.__defineGetter__("EstimatedModuleSize", function() {
        return this.estimatedModuleSize
    });
    this.__defineGetter__("Count", function() {
        return this.count
    });
    this.__defineGetter__("X", function() {
        return this.x
    });
    this.__defineGetter__("Y", function() {
        return this.y
    });
    this.incrementCount = function() {
        this.count++
    };
    this.aboutEquals = function(b, a, c) {
        return Math.abs(a - this.y) <= b && Math.abs(c - this.x) <= b ? (b = Math.abs(b - this.estimatedModuleSize),
            1 >= b || 1 >= b / this.estimatedModuleSize) : !1
    }
}

function FinderPatternInfo(d) {
    this.bottomLeft = d[0];
    this.topLeft = d[1];
    this.topRight = d[2];
    this.__defineGetter__("BottomLeft", function() {
        return this.bottomLeft
    });
    this.__defineGetter__("TopLeft", function() {
        return this.topLeft
    });
    this.__defineGetter__("TopRight", function() {
        return this.topRight
    })
}

function FinderPatternFinder() {
    this.image = null;
    this.possibleCenters = [];
    this.hasSkipped = !1;
    this.crossCheckStateCount = [0, 0, 0, 0, 0];
    this.resultPointCallback = null;
    this.__defineGetter__("CrossCheckStateCount", function() {
        this.crossCheckStateCount[0] = 0;
        this.crossCheckStateCount[1] = 0;
        this.crossCheckStateCount[2] = 0;
        this.crossCheckStateCount[3] = 0;
        this.crossCheckStateCount[4] = 0;
        return this.crossCheckStateCount
    });
    this.foundPatternCross = function(d) {
        for (var a = 0, c = 0; 5 > c; c++) {
            var b = d[c];
            if (0 == b) return !1;
            a += b
        }
        if (7 >
            a) return !1;
        a = Math.floor((a << INTEGER_MATH_SHIFT) / 7);
        c = Math.floor(a / 2);
        return Math.abs(a - (d[0] << INTEGER_MATH_SHIFT)) < c && Math.abs(a - (d[1] << INTEGER_MATH_SHIFT)) < c && Math.abs(3 * a - (d[2] << INTEGER_MATH_SHIFT)) < 3 * c && Math.abs(a - (d[3] << INTEGER_MATH_SHIFT)) < c && Math.abs(a - (d[4] << INTEGER_MATH_SHIFT)) < c
    };
    this.centerFromEnd = function(d, a) {
        return a - d[4] - d[3] - d[2] / 2
    };
    this.crossCheckVertical = function(d, a, c, b) {
        for (var e = this.image, g = qrcode.height, f = this.CrossCheckStateCount, h = d; 0 <= h && e[a + h * qrcode.width];) f[2]++, h--;
        if (0 >
            h) return NaN;
        for (; 0 <= h && !e[a + h * qrcode.width] && f[1] <= c;) f[1]++, h--;
        if (0 > h || f[1] > c) return NaN;
        for (; 0 <= h && e[a + h * qrcode.width] && f[0] <= c;) f[0]++, h--;
        if (f[0] > c) return NaN;
        for (h = d + 1; h < g && e[a + h * qrcode.width];) f[2]++, h++;
        if (h == g) return NaN;
        for (; h < g && !e[a + h * qrcode.width] && f[3] < c;) f[3]++, h++;
        if (h == g || f[3] >= c) return NaN;
        for (; h < g && e[a + h * qrcode.width] && f[4] < c;) f[4]++, h++;
        return f[4] >= c || 5 * Math.abs(f[0] + f[1] + f[2] + f[3] + f[4] - b) >= 2 * b ? NaN : this.foundPatternCross(f) ? this.centerFromEnd(f, h) : NaN
    };
    this.crossCheckHorizontal =
        function(d, a, c, b) {
            for (var e = this.image, g = qrcode.width, f = this.CrossCheckStateCount, h = d; 0 <= h && e[h + a * qrcode.width];) f[2]++, h--;
            if (0 > h) return NaN;
            for (; 0 <= h && !e[h + a * qrcode.width] && f[1] <= c;) f[1]++, h--;
            if (0 > h || f[1] > c) return NaN;
            for (; 0 <= h && e[h + a * qrcode.width] && f[0] <= c;) f[0]++, h--;
            if (f[0] > c) return NaN;
            for (h = d + 1; h < g && e[h + a * qrcode.width];) f[2]++, h++;
            if (h == g) return NaN;
            for (; h < g && !e[h + a * qrcode.width] && f[3] < c;) f[3]++, h++;
            if (h == g || f[3] >= c) return NaN;
            for (; h < g && e[h + a * qrcode.width] && f[4] < c;) f[4]++, h++;
            return f[4] >=
                c || 5 * Math.abs(f[0] + f[1] + f[2] + f[3] + f[4] - b) >= b ? NaN : this.foundPatternCross(f) ? this.centerFromEnd(f, h) : NaN
        };
    this.handlePossibleCenter = function(d, a, c) {
        var b = d[0] + d[1] + d[2] + d[3] + d[4];
        c = this.centerFromEnd(d, c);
        a = this.crossCheckVertical(a, Math.floor(c), d[2], b);
        if (!isNaN(a) && (c = this.crossCheckHorizontal(Math.floor(c), Math.floor(a), d[2], b), !isNaN(c))) {
            d = b / 7;
            for (var b = !1, e = this.possibleCenters.length, g = 0; g < e; g++) {
                var f = this.possibleCenters[g];
                if (f.aboutEquals(d, a, c)) {
                    f.incrementCount();
                    b = !0;
                    break
                }
            }
            b || (c = new FinderPattern(c,
                a, d), this.possibleCenters.push(c), null != this.resultPointCallback && this.resultPointCallback.foundPossibleResultPoint(c));
            return !0
        }
        return !1
    };
    this.selectBestPatterns = function() {
        var d = this.possibleCenters.length;
        if (3 > d) throw "Couldn't find enough finder patterns";
        if (3 < d) {
            for (var a = 0, c = 0; c < d; c++) a += this.possibleCenters[c].EstimatedModuleSize;
            d = a / d;
            for (c = 0; c < this.possibleCenters.length && 3 < this.possibleCenters.length; c++) Math.abs(this.possibleCenters[c].EstimatedModuleSize - d) > 0.2 * d && (this.possibleCenters.remove(c),
                c--)
        }
        return [this.possibleCenters[0], this.possibleCenters[1], this.possibleCenters[2]]
    };
    this.findRowSkip = function() {
        var d = this.possibleCenters.length;
        if (1 >= d) return 0;
        for (var a = null, c = 0; c < d; c++) {
            var b = this.possibleCenters[c];
            if (b.Count >= CENTER_QUORUM)
                if (null == a) a = b;
                else return this.hasSkipped = !0, Math.floor((Math.abs(a.X - b.X) - Math.abs(a.Y - b.Y)) / 2)
        }
        return 0
    };
    this.haveMultiplyConfirmedCenters = function() {
        for (var d = 0, a = 0, c = this.possibleCenters.length, b = 0; b < c; b++) {
            var e = this.possibleCenters[b];
            e.Count >= CENTER_QUORUM &&
                (d++, a += e.EstimatedModuleSize)
        }
        if (3 > d) return !1;
        for (var d = a / c, g = 0, b = 0; b < c; b++) e = this.possibleCenters[b], g += Math.abs(e.EstimatedModuleSize - d);
        return g <= 0.05 * a
    };
    this.findFinderPattern = function(d) {
        this.image = d;
        var a = qrcode.height,
            c = qrcode.width,
            b = Math.floor(3 * a / (4 * MAX_MODULES));
        b < MIN_SKIP && (b = MIN_SKIP);
        for (var e = !1, g = Array(5), f = b - 1; f < a && !e; f += b) {
            g[0] = 0;
            g[1] = 0;
            g[2] = 0;
            g[3] = 0;
            for (var h = g[4] = 0, j = 0; j < c; j++)
                if (d[j + f * qrcode.width]) 1 == (h & 1) && h++, g[h]++;
                else if (0 == (h & 1))
                if (4 == h)
                    if (this.foundPatternCross(g)) {
                        if (h =
                            this.handlePossibleCenter(g, f, j)) b = 2, this.hasSkipped ? e = this.haveMultiplyConfirmedCenters() : (h = this.findRowSkip(), h > g[2] && (f += h - g[2] - b, j = c - 1));
                        else {
                            do j++; while (j < c && !d[j + f * qrcode.width]);
                            j--
                        }
                        h = 0;
                        g[0] = 0;
                        g[1] = 0;
                        g[2] = 0;
                        g[3] = 0;
                        g[4] = 0
                    } else g[0] = g[2], g[1] = g[3], g[2] = g[4], g[3] = 1, g[4] = 0, h = 3;
            else g[++h]++;
            else g[h]++;
            this.foundPatternCross(g) && this.handlePossibleCenter(g, f, c) && (b = g[0], this.hasSkipped && (e = haveMultiplyConfirmedCenters()))
        }
        d = this.selectBestPatterns();
        qrcode.orderBestPatterns(d);
        return new FinderPatternInfo(d)
    }
}

function AlignmentPattern(d, a, c) {
    this.x = d;
    this.y = a;
    this.count = 1;
    this.estimatedModuleSize = c;
    this.__defineGetter__("EstimatedModuleSize", function() {
        return this.estimatedModuleSize
    });
    this.__defineGetter__("Count", function() {
        return this.count
    });
    this.__defineGetter__("X", function() {
        return Math.floor(this.x)
    });
    this.__defineGetter__("Y", function() {
        return Math.floor(this.y)
    });
    this.incrementCount = function() {
        this.count++
    };
    this.aboutEquals = function(b, a, c) {
        return Math.abs(a - this.y) <= b && Math.abs(c - this.x) <= b ?
            (b = Math.abs(b - this.estimatedModuleSize), 1 >= b || 1 >= b / this.estimatedModuleSize) : !1
    }
}

function AlignmentPatternFinder(d, a, c, b, e, g, f) {
    this.image = d;
    this.possibleCenters = [];
    this.startX = a;
    this.startY = c;
    this.width = b;
    this.height = e;
    this.moduleSize = g;
    this.crossCheckStateCount = [0, 0, 0];
    this.resultPointCallback = f;
    this.centerFromEnd = function(b, a) {
        return a - b[2] - b[1] / 2
    };
    this.foundPatternCross = function(b) {
        for (var a = this.moduleSize, c = a / 2, d = 0; 3 > d; d++)
            if (Math.abs(a - b[d]) >= c) return !1;
        return !0
    };
    this.crossCheckVertical = function(b, a, c, d) {
        var e = this.image,
            g = qrcode.height,
            f = this.crossCheckStateCount;
        f[0] =
            0;
        f[1] = 0;
        f[2] = 0;
        for (var m = b; 0 <= m && e[a + m * qrcode.width] && f[1] <= c;) f[1]++, m--;
        if (0 > m || f[1] > c) return NaN;
        for (; 0 <= m && !e[a + m * qrcode.width] && f[0] <= c;) f[0]++, m--;
        if (f[0] > c) return NaN;
        for (m = b + 1; m < g && e[a + m * qrcode.width] && f[1] <= c;) f[1]++, m++;
        if (m == g || f[1] > c) return NaN;
        for (; m < g && !e[a + m * qrcode.width] && f[2] <= c;) f[2]++, m++;
        return f[2] > c || 5 * Math.abs(f[0] + f[1] + f[2] - d) >= 2 * d ? NaN : this.foundPatternCross(f) ? this.centerFromEnd(f, m) : NaN
    };
    this.handlePossibleCenter = function(b, a, c) {
        var d = b[0] + b[1] + b[2];
        c = this.centerFromEnd(b,
            c);
        a = this.crossCheckVertical(a, Math.floor(c), 2 * b[1], d);
        if (!isNaN(a)) {
            b = (b[0] + b[1] + b[2]) / 3;
            for (var d = this.possibleCenters.length, e = 0; e < d; e++)
                if (this.possibleCenters[e].aboutEquals(b, a, c)) return new AlignmentPattern(c, a, b);
            c = new AlignmentPattern(c, a, b);
            this.possibleCenters.push(c);
            null != this.resultPointCallback && this.resultPointCallback.foundPossibleResultPoint(c)
        }
        return null
    };
    this.find = function() {
        for (var a = this.startX, e = this.height, g = a + b, f = c + (e >> 1), l = [0, 0, 0], s = 0; s < e; s++) {
            var r = f + (0 == (s & 1) ? s + 1 >> 1 : -(s +
                1 >> 1));
            l[0] = 0;
            l[1] = 0;
            l[2] = 0;
            for (var m = a; m < g && !d[m + qrcode.width * r];) m++;
            for (var q = 0; m < g;) {
                if (d[m + r * qrcode.width])
                    if (1 == q) l[q]++;
                    else if (2 == q) {
                    if (this.foundPatternCross(l) && (q = this.handlePossibleCenter(l, r, m), null != q)) return q;
                    l[0] = l[2];
                    l[1] = 1;
                    l[2] = 0;
                    q = 1
                } else l[++q]++;
                else 1 == q && q++, l[q]++;
                m++
            }
            if (this.foundPatternCross(l) && (q = this.handlePossibleCenter(l, r, g), null != q)) return q
        }
        if (0 != this.possibleCenters.length) return this.possibleCenters[0];
        throw "Couldn't find enough alignment patterns";
    }
}

function QRCodeDataBlockReader(d, a, c) {
    this.blockPointer = 0;
    this.bitPointer = 7;
    this.dataLength = 0;
    this.blocks = d;
    this.numErrorCorrectionCode = c;
    9 >= a ? this.dataLengthMode = 0 : 10 <= a && 26 >= a ? this.dataLengthMode = 1 : 27 <= a && 40 >= a && (this.dataLengthMode = 2);
    this.getNextBits = function(b) {
        var a = 0;
        if (b < this.bitPointer + 1) {
            for (var c = 0, a = 0; a < b; a++) c += 1 << a;
            c <<= this.bitPointer - b + 1;
            a = (this.blocks[this.blockPointer] & c) >> this.bitPointer - b + 1;
            this.bitPointer -= b;
            return a
        }
        if (b < this.bitPointer + 1 + 8) {
            for (var d = 0, a = 0; a < this.bitPointer +
                1; a++) d += 1 << a;
            a = (this.blocks[this.blockPointer] & d) << b - (this.bitPointer + 1);
            this.blockPointer++;
            a += this.blocks[this.blockPointer] >> 8 - (b - (this.bitPointer + 1));
            this.bitPointer -= b % 8;
            0 > this.bitPointer && (this.bitPointer = 8 + this.bitPointer);
            return a
        }
        if (b < this.bitPointer + 1 + 16) {
            for (a = c = d = 0; a < this.bitPointer + 1; a++) d += 1 << a;
            d = (this.blocks[this.blockPointer] & d) << b - (this.bitPointer + 1);
            this.blockPointer++;
            var h = this.blocks[this.blockPointer] << b - (this.bitPointer + 1 + 8);
            this.blockPointer++;
            for (a = 0; a < b - (this.bitPointer +
                    1 + 8); a++) c += 1 << a;
            c <<= 8 - (b - (this.bitPointer + 1 + 8));
            a = d + h + ((this.blocks[this.blockPointer] & c) >> 8 - (b - (this.bitPointer + 1 + 8)));
            this.bitPointer -= (b - 8) % 8;
            0 > this.bitPointer && (this.bitPointer = 8 + this.bitPointer);
            return a
        }
        return 0
    };
    this.NextMode = function() {
        return this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2 ? 0 : this.getNextBits(4)
    };
    this.getDataLength = function(b) {
        for (var a = 0; 1 != b >> a;) a++;
        return this.getNextBits(qrcode.sizeOfDataLengthInfo[this.dataLengthMode][a])
    };
    this.getRomanAndFigureString =
        function(b) {
            var a = 0,
                c = "",
                d = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split("");
            do
                if (1 < b) {
                    var a = this.getNextBits(11),
                        h = a % 45,
                        c = c + d[Math.floor(a / 45)],
                        c = c + d[h];
                    b -= 2
                } else 1 == b && (a = this.getNextBits(6), c += d[a], b -= 1);
            while (0 < b);
            return c
        };
    this.getFigureString = function(b) {
        var a = 0,
            c = "";
        do 3 <= b ? (a = this.getNextBits(10), 100 > a && (c += "0"), 10 > a && (c += "0"), b -= 3) : 2 == b ? (a = this.getNextBits(7), 10 > a && (c += "0"), b -= 2) : 1 == b && (a = this.getNextBits(4), b -= 1), c += a; while (0 < b);
        return c
    };
    this.get8bitByteArray = function(b) {
        var a =
            0,
            c = [];
        do a = this.getNextBits(8), c.push(a), b--; while (0 < b);
        return c
    };
    this.getKanjiString = function(b) {
        var a = 0,
            c = "";
        do {
            var a = getNextBits(13),
                a = (a / 192 << 8) + a % 192,
                d = 0,
                d = 40956 >= a + 33088 ? a + 33088 : a + 49472,
                c = c + String.fromCharCode(d);
            b--
        } while (0 < b);
        return c
    };
    this.__defineGetter__("DataByte", function() {
        var b = [];
        do {
            var a = this.NextMode();
            if (0 == a)
                if (0 < b.length) break;
                else throw "Empty data block";
            if (1 != a && 2 != a && 4 != a && 8 != a) throw "Invalid mode: " + a + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
            dataLength =
                this.getDataLength(a);
            if (1 > dataLength) throw "Invalid data length: " + dataLength;
            switch (a) {
                case 1:
                    for (var a = this.getFigureString(dataLength), c = Array(a.length), d = 0; d < a.length; d++) c[d] = a.charCodeAt(d);
                    b.push(c);
                    break;
                case 2:
                    a = this.getRomanAndFigureString(dataLength);
                    c = Array(a.length);
                    for (d = 0; d < a.length; d++) c[d] = a.charCodeAt(d);
                    b.push(c);
                    break;
                case 4:
                    a = this.get8bitByteArray(dataLength);
                    b.push(a);
                    break;
                case 8:
                    a = this.getKanjiString(dataLength), b.push(a)
            }
        } while (1);
        return b
    })
};