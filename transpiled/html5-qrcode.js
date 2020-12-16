"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
  Ported to JavaScript by Lazar Laszlo 2011 
  
  lazarsoft@gmail.com, www.lazarsoft.info
  
*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function getLazarSoftScanner() {
  var GridSampler = {};

  GridSampler.checkAndNudgePoints = function (image, points) {
    var width = qrcode.width;
    var height = qrcode.height; // Check and nudge points from start until we see some that are OK:

    var nudged = true;

    for (var offset = 0; offset < points.length && nudged; offset += 2) {
      var x = Math.floor(points[offset]);
      var y = Math.floor(points[offset + 1]);

      if (x < -1 || x > width || y < -1 || y > height) {
        throw "Error.checkAndNudgePoints ";
      }

      nudged = false;

      if (x == -1) {
        points[offset] = 0.0;
        nudged = true;
      } else if (x == width) {
        points[offset] = width - 1;
        nudged = true;
      }

      if (y == -1) {
        points[offset + 1] = 0.0;
        nudged = true;
      } else if (y == height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    } // Check and nudge points from end:


    nudged = true;

    for (var offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
      var x = Math.floor(points[offset]);
      var y = Math.floor(points[offset + 1]);

      if (x < -1 || x > width || y < -1 || y > height) {
        throw "Error.checkAndNudgePoints ";
      }

      nudged = false;

      if (x == -1) {
        points[offset] = 0.0;
        nudged = true;
      } else if (x == width) {
        points[offset] = width - 1;
        nudged = true;
      }

      if (y == -1) {
        points[offset + 1] = 0.0;
        nudged = true;
      } else if (y == height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
  };

  GridSampler.sampleGrid3 = function (image, dimension, transform) {
    var bits = new BitMatrix(dimension);
    var points = new Array(dimension << 1);

    for (var y = 0; y < dimension; y++) {
      var max = points.length;
      var iValue = y + 0.5;

      for (var x = 0; x < max; x += 2) {
        points[x] = (x >> 1) + 0.5;
        points[x + 1] = iValue;
      }

      transform.transformPoints1(points); // Quick check to see if points transformed to something inside the image;
      // sufficient to check the endpoints

      GridSampler.checkAndNudgePoints(image, points);

      try {
        for (var x = 0; x < max; x += 2) {
          //var xpoint = (Math.floor( points[x]) * 4) + (Math.floor( points[x + 1]) * qrcode.width * 4);
          var bit = image[Math.floor(points[x]) + qrcode.width * Math.floor(points[x + 1])]; //qrcode.imagedata.data[xpoint] = bit?255:0;
          //qrcode.imagedata.data[xpoint+1] = bit?255:0;
          //qrcode.imagedata.data[xpoint+2] = 0;
          //qrcode.imagedata.data[xpoint+3] = 255;
          //bits[x >> 1][ y]=bit;

          if (bit) bits.set_Renamed(x >> 1, y);
        }
      } catch (aioobe) {
        // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
        // transform gets "twisted" such that it maps a straight line of points to a set of points
        // whose endpoints are in bounds, but others are not. There is probably some mathematical
        // way to detect this about the transformation that I don't know yet.
        // This results in an ugly runtime exception despite our clever checks above -- can't have
        // that. We could check each point's coordinates but that feels duplicative. We settle for
        // catching and wrapping ArrayIndexOutOfBoundsException.
        throw "Error.checkAndNudgePoints";
      }
    }

    return bits;
  };

  GridSampler.sampleGridx = function (image, dimension, p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY) {
    var transform = PerspectiveTransform.quadrilateralToQuadrilateral(p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);
    return GridSampler.sampleGrid3(image, dimension, transform);
  };

  function ECB(count, dataCodewords) {
    this.count = count;
    this.dataCodewords = dataCodewords;

    this.__defineGetter__("Count", function () {
      return this.count;
    });

    this.__defineGetter__("DataCodewords", function () {
      return this.dataCodewords;
    });
  }

  function ECBlocks(ecCodewordsPerBlock, ecBlocks1, ecBlocks2) {
    this.ecCodewordsPerBlock = ecCodewordsPerBlock;
    if (ecBlocks2) this.ecBlocks = new Array(ecBlocks1, ecBlocks2);else this.ecBlocks = new Array(ecBlocks1);

    this.__defineGetter__("ECCodewordsPerBlock", function () {
      return this.ecCodewordsPerBlock;
    });

    this.__defineGetter__("TotalECCodewords", function () {
      return this.ecCodewordsPerBlock * this.NumBlocks;
    });

    this.__defineGetter__("NumBlocks", function () {
      var total = 0;

      for (var i = 0; i < this.ecBlocks.length; i++) {
        total += this.ecBlocks[i].length;
      }

      return total;
    });

    this.getECBlocks = function () {
      return this.ecBlocks;
    };
  }

  function Version(versionNumber, alignmentPatternCenters, ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4) {
    this.versionNumber = versionNumber;
    this.alignmentPatternCenters = alignmentPatternCenters;
    this.ecBlocks = new Array(ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4);
    var total = 0;
    var ecCodewords = ecBlocks1.ECCodewordsPerBlock;
    var ecbArray = ecBlocks1.getECBlocks();

    for (var i = 0; i < ecbArray.length; i++) {
      var ecBlock = ecbArray[i];
      total += ecBlock.Count * (ecBlock.DataCodewords + ecCodewords);
    }

    this.totalCodewords = total;

    this.__defineGetter__("VersionNumber", function () {
      return this.versionNumber;
    });

    this.__defineGetter__("AlignmentPatternCenters", function () {
      return this.alignmentPatternCenters;
    });

    this.__defineGetter__("TotalCodewords", function () {
      return this.totalCodewords;
    });

    this.__defineGetter__("DimensionForVersion", function () {
      return 17 + 4 * this.versionNumber;
    });

    this.buildFunctionPattern = function () {
      var dimension = this.DimensionForVersion;
      var bitMatrix = new BitMatrix(dimension); // Top left finder pattern + separator + format

      bitMatrix.setRegion(0, 0, 9, 9); // Top right finder pattern + separator + format

      bitMatrix.setRegion(dimension - 8, 0, 8, 9); // Bottom left finder pattern + separator + format

      bitMatrix.setRegion(0, dimension - 8, 9, 8); // Alignment patterns

      var max = this.alignmentPatternCenters.length;

      for (var x = 0; x < max; x++) {
        var i = this.alignmentPatternCenters[x] - 2;

        for (var y = 0; y < max; y++) {
          if (x == 0 && (y == 0 || y == max - 1) || x == max - 1 && y == 0) {
            // No alignment patterns near the three finder paterns
            continue;
          }

          bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
        }
      } // Vertical timing pattern


      bitMatrix.setRegion(6, 9, 1, dimension - 17); // Horizontal timing pattern

      bitMatrix.setRegion(9, 6, dimension - 17, 1);

      if (this.versionNumber > 6) {
        // Version info, top right
        bitMatrix.setRegion(dimension - 11, 0, 3, 6); // Version info, bottom left

        bitMatrix.setRegion(0, dimension - 11, 6, 3);
      }

      return bitMatrix;
    };

    this.getECBlocksForLevel = function (ecLevel) {
      return this.ecBlocks[ecLevel.ordinal()];
    };
  }

  Version.VERSION_DECODE_INFO = new Array(0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78, 0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB, 0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B, 0x2542E, 0x26A64, 0x27541, 0x28C69);
  Version.VERSIONS = buildVersions();

  Version.getVersionForNumber = function (versionNumber) {
    if (versionNumber < 1 || versionNumber > 40) {
      throw "ArgumentException";
    }

    return Version.VERSIONS[versionNumber - 1];
  };

  Version.getProvisionalVersionForDimension = function (dimension) {
    if (dimension % 4 != 1) {
      throw "Error getProvisionalVersionForDimension";
    }

    try {
      return Version.getVersionForNumber(dimension - 17 >> 2);
    } catch (iae) {
      throw "Error getVersionForNumber";
    }
  };

  Version.decodeVersionInformation = function (versionBits) {
    var bestDifference = 0xffffffff;
    var bestVersion = 0;

    for (var i = 0; i < Version.VERSION_DECODE_INFO.length; i++) {
      var targetVersion = Version.VERSION_DECODE_INFO[i]; // Do the version info bits match exactly? done.

      if (targetVersion == versionBits) {
        return this.getVersionForNumber(i + 7);
      } // Otherwise see if this is the closest to a real version info bit string
      // we have seen so far


      var bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);

      if (bitsDifference < bestDifference) {
        bestVersion = i + 7;
        bestDifference = bitsDifference;
      }
    } // We can tolerate up to 3 bits of error since no two version info codewords will
    // differ in less than 4 bits.


    if (bestDifference <= 3) {
      return this.getVersionForNumber(bestVersion);
    } // If we didn't find a close enough match, fail


    return null;
  };

  function buildVersions() {
    return new Array(new Version(1, new Array(), new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))), new Version(2, new Array(6, 18), new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))), new Version(3, new Array(6, 22), new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))), new Version(4, new Array(6, 26), new ECBlocks(20, new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))), new Version(5, new Array(6, 30), new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))), new Version(6, new Array(6, 34), new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))), new Version(7, new Array(6, 22, 38), new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4, 31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))), new Version(8, new Array(6, 24, 42), new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))), new Version(9, new Array(6, 26, 46), new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))), new Version(10, new Array(6, 28, 50), new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))), new Version(11, new Array(6, 30, 54), new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))), new Version(12, new Array(6, 32, 58), new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))), new Version(13, new Array(6, 34, 62), new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))), new Version(14, new Array(6, 26, 46, 66), new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))), new Version(15, new Array(6, 26, 48, 70), new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))), new Version(16, new Array(6, 26, 50, 74), new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))), new Version(17, new Array(6, 30, 54, 78), new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))), new Version(18, new Array(6, 30, 56, 82), new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))), new Version(19, new Array(6, 30, 58, 86), new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))), new Version(20, new Array(6, 34, 62, 90), new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))), new Version(21, new Array(6, 28, 50, 72, 94), new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))), new Version(22, new Array(6, 26, 50, 74, 98), new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))), new Version(23, new Array(6, 30, 54, 74, 102), new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))), new Version(24, new Array(6, 28, 54, 80, 106), new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))), new Version(25, new Array(6, 32, 58, 84, 110), new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))), new Version(26, new Array(6, 30, 58, 86, 114), new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))), new Version(27, new Array(6, 34, 62, 90, 118), new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))), new Version(28, new Array(6, 26, 50, 74, 98, 122), new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))), new Version(29, new Array(6, 30, 54, 78, 102, 126), new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))), new Version(30, new Array(6, 26, 52, 78, 104, 130), new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))), new Version(31, new Array(6, 30, 56, 82, 108, 134), new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))), new Version(32, new Array(6, 34, 60, 86, 112, 138), new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))), new Version(33, new Array(6, 30, 58, 86, 114, 142), new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))), new Version(34, new Array(6, 34, 62, 90, 118, 146), new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))), new Version(35, new Array(6, 30, 54, 78, 102, 126, 150), new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))), new Version(36, new Array(6, 24, 50, 76, 102, 128, 154), new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))), new Version(37, new Array(6, 28, 54, 80, 106, 132, 158), new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))), new Version(38, new Array(6, 32, 58, 84, 110, 136, 162), new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))), new Version(39, new Array(6, 26, 54, 82, 110, 138, 166), new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))), new Version(40, new Array(6, 30, 58, 86, 114, 142, 170), new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))));
  }

  function PerspectiveTransform(a11, a21, a31, a12, a22, a32, a13, a23, a33) {
    this.a11 = a11;
    this.a12 = a12;
    this.a13 = a13;
    this.a21 = a21;
    this.a22 = a22;
    this.a23 = a23;
    this.a31 = a31;
    this.a32 = a32;
    this.a33 = a33;

    this.transformPoints1 = function (points) {
      var max = points.length;
      var a11 = this.a11;
      var a12 = this.a12;
      var a13 = this.a13;
      var a21 = this.a21;
      var a22 = this.a22;
      var a23 = this.a23;
      var a31 = this.a31;
      var a32 = this.a32;
      var a33 = this.a33;

      for (var i = 0; i < max; i += 2) {
        var x = points[i];
        var y = points[i + 1];
        var denominator = a13 * x + a23 * y + a33;
        points[i] = (a11 * x + a21 * y + a31) / denominator;
        points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
      }
    };

    this.transformPoints2 = function (xValues, yValues) {
      var n = xValues.length;

      for (var i = 0; i < n; i++) {
        var x = xValues[i];
        var y = yValues[i];
        var denominator = this.a13 * x + this.a23 * y + this.a33;
        xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
        yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
      }
    };

    this.buildAdjoint = function () {
      // Adjoint is the transpose of the cofactor matrix:
      return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21);
    };

    this.times = function (other) {
      return new PerspectiveTransform(this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13, this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23, this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33, this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13, this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23, this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33, this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13, this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23, this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
    };
  }

  PerspectiveTransform.quadrilateralToQuadrilateral = function (x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {
    var qToS = this.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    var sToQ = this.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
    return sToQ.times(qToS);
  };

  PerspectiveTransform.squareToQuadrilateral = function (x0, y0, x1, y1, x2, y2, x3, y3) {
    var dy2 = y3 - y2;
    var dy3 = y0 - y1 + y2 - y3;

    if (dy2 == 0.0 && dy3 == 0.0) {
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
    } else {
      var dx1 = x1 - x2;
      var dx2 = x3 - x2;
      var dx3 = x0 - x1 + x2 - x3;
      var dy1 = y1 - y2;
      var denominator = dx1 * dy2 - dx2 * dy1;
      var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
    }
  };

  PerspectiveTransform.quadrilateralToSquare = function (x0, y0, x1, y1, x2, y2, x3, y3) {
    // Here, the adjoint serves as the inverse:
    return this.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
  };

  function DetectorResult(bits, points) {
    this.bits = bits;
    this.points = points;
  }

  function Detector(image) {
    this.image = image;
    this.resultPointCallback = null;

    this.sizeOfBlackWhiteBlackRun = function (fromX, fromY, toX, toY) {
      // Mild variant of Bresenham's algorithm;
      // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
      var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);

      if (steep) {
        var temp = fromX;
        fromX = fromY;
        fromY = temp;
        temp = toX;
        toX = toY;
        toY = temp;
      }

      var dx = Math.abs(toX - fromX);
      var dy = Math.abs(toY - fromY);
      var error = -dx >> 1;
      var ystep = fromY < toY ? 1 : -1;
      var xstep = fromX < toX ? 1 : -1;
      var state = 0; // In black pixels, looking for white, first or second time

      for (var x = fromX, y = fromY; x != toX; x += xstep) {
        var realX = steep ? y : x;
        var realY = steep ? x : y;

        if (state == 1) {
          // In white pixels, looking for black
          if (this.image[realX + realY * qrcode.width]) {
            state++;
          }
        } else {
          if (!this.image[realX + realY * qrcode.width]) {
            state++;
          }
        }

        if (state == 3) {
          // Found black, white, black, and stumbled back onto white; done
          var diffX = x - fromX;
          var diffY = y - fromY;
          return Math.sqrt(diffX * diffX + diffY * diffY);
        }

        error += dy;

        if (error > 0) {
          if (y == toY) {
            break;
          }

          y += ystep;
          error -= dx;
        }
      }

      var diffX2 = toX - fromX;
      var diffY2 = toY - fromY;
      return Math.sqrt(diffX2 * diffX2 + diffY2 * diffY2);
    };

    this.sizeOfBlackWhiteBlackRunBothWays = function (fromX, fromY, toX, toY) {
      var result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY); // Now count other way -- don't run off image though of course

      var scale = 1.0;
      var otherToX = fromX - (toX - fromX);

      if (otherToX < 0) {
        scale = fromX / (fromX - otherToX);
        otherToX = 0;
      } else if (otherToX >= qrcode.width) {
        scale = (qrcode.width - 1 - fromX) / (otherToX - fromX);
        otherToX = qrcode.width - 1;
      }

      var otherToY = Math.floor(fromY - (toY - fromY) * scale);
      scale = 1.0;

      if (otherToY < 0) {
        scale = fromY / (fromY - otherToY);
        otherToY = 0;
      } else if (otherToY >= qrcode.height) {
        scale = (qrcode.height - 1 - fromY) / (otherToY - fromY);
        otherToY = qrcode.height - 1;
      }

      otherToX = Math.floor(fromX + (otherToX - fromX) * scale);
      result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
      return result - 1.0; // -1 because we counted the middle pixel twice
    };

    this.calculateModuleSizeOneWay = function (pattern, otherPattern) {
      var moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(pattern.X), Math.floor(pattern.Y), Math.floor(otherPattern.X), Math.floor(otherPattern.Y));
      var moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor(pattern.X), Math.floor(pattern.Y));

      if (isNaN(moduleSizeEst1)) {
        return moduleSizeEst2 / 7.0;
      }

      if (isNaN(moduleSizeEst2)) {
        return moduleSizeEst1 / 7.0;
      } // Average them, and divide by 7 since we've counted the width of 3 black modules,
      // and 1 white and 1 black module on either side. Ergo, divide sum by 14.


      return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
    };

    this.calculateModuleSize = function (topLeft, topRight, bottomLeft) {
      // Take the average
      return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
    };

    this.distance = function (pattern1, pattern2) {
      var xDiff = pattern1.X - pattern2.X;
      var yDiff = pattern1.Y - pattern2.Y;
      return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    };

    this.computeDimension = function (topLeft, topRight, bottomLeft, moduleSize) {
      var tltrCentersDimension = Math.round(this.distance(topLeft, topRight) / moduleSize);
      var tlblCentersDimension = Math.round(this.distance(topLeft, bottomLeft) / moduleSize);
      var dimension = (tltrCentersDimension + tlblCentersDimension >> 1) + 7;

      switch (dimension & 0x03) {
        // mod 4
        case 0:
          dimension++;
          break;
        // 1? do nothing

        case 2:
          dimension--;
          break;

        case 3:
          throw "Error";
      }

      return dimension;
    };

    this.findAlignmentInRegion = function (overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
      // Look for an alignment pattern (3 modules in size) around where it
      // should be
      var allowance = Math.floor(allowanceFactor * overallEstModuleSize);
      var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
      var alignmentAreaRightX = Math.min(qrcode.width - 1, estAlignmentX + allowance);

      if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
        throw "Error";
      }

      var alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
      var alignmentAreaBottomY = Math.min(qrcode.height - 1, estAlignmentY + allowance);
      var alignmentFinder = new AlignmentPatternFinder(this.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, this.resultPointCallback);
      return alignmentFinder.find();
    };

    this.createTransform = function (topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
      var dimMinusThree = dimension - 3.5;
      var bottomRightX;
      var bottomRightY;
      var sourceBottomRightX;
      var sourceBottomRightY;

      if (alignmentPattern != null) {
        bottomRightX = alignmentPattern.X;
        bottomRightY = alignmentPattern.Y;
        sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
      } else {
        // Don't have an alignment pattern, just make up the bottom-right point
        bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
        bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y;
        sourceBottomRightX = sourceBottomRightY = dimMinusThree;
      }

      var transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);
      return transform;
    };

    this.sampleGrid = function (image, transform, dimension) {
      var sampler = GridSampler;
      return sampler.sampleGrid3(image, dimension, transform);
    };

    this.processFinderPatternInfo = function (info) {
      var topLeft = info.TopLeft;
      var topRight = info.TopRight;
      var bottomLeft = info.BottomLeft;
      var moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);

      if (moduleSize < 1.0) {
        throw "Error";
      }

      var dimension = this.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
      var provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
      var modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7;
      var alignmentPattern = null; // Anything above version 1 has an alignment pattern

      if (provisionalVersion.AlignmentPatternCenters.length > 0) {
        // Guess where a "bottom right" finder pattern would have been
        var bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
        var bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y; // Estimate that alignment pattern is closer by 3 modules
        // from "bottom right" to known top left location

        var correctionToTopLeft = 1.0 - 3.0 / modulesBetweenFPCenters;
        var estAlignmentX = Math.floor(topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X));
        var estAlignmentY = Math.floor(topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y)); // Kind of arbitrary -- expand search radius before giving up

        for (var i = 4; i <= 16; i <<= 1) {
          //try
          //{
          alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
          break; //}
          //catch (re)
          //{
          // try next round
          //}
        } // If we didn't find alignment pattern... well try anyway without it

      }

      var transform = this.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);
      var bits = this.sampleGrid(this.image, transform, dimension);
      var points;

      if (alignmentPattern == null) {
        points = new Array(bottomLeft, topLeft, topRight);
      } else {
        points = new Array(bottomLeft, topLeft, topRight, alignmentPattern);
      }

      return new DetectorResult(bits, points);
    };

    this.detect = function () {
      var info = new FinderPatternFinder().findFinderPattern(this.image);
      return this.processFinderPatternInfo(info);
    };
  }

  var FORMAT_INFO_MASK_QR = 0x5412;
  var FORMAT_INFO_DECODE_LOOKUP = new Array(new Array(0x5412, 0x00), new Array(0x5125, 0x01), new Array(0x5E7C, 0x02), new Array(0x5B4B, 0x03), new Array(0x45F9, 0x04), new Array(0x40CE, 0x05), new Array(0x4F97, 0x06), new Array(0x4AA0, 0x07), new Array(0x77C4, 0x08), new Array(0x72F3, 0x09), new Array(0x7DAA, 0x0A), new Array(0x789D, 0x0B), new Array(0x662F, 0x0C), new Array(0x6318, 0x0D), new Array(0x6C41, 0x0E), new Array(0x6976, 0x0F), new Array(0x1689, 0x10), new Array(0x13BE, 0x11), new Array(0x1CE7, 0x12), new Array(0x19D0, 0x13), new Array(0x0762, 0x14), new Array(0x0255, 0x15), new Array(0x0D0C, 0x16), new Array(0x083B, 0x17), new Array(0x355F, 0x18), new Array(0x3068, 0x19), new Array(0x3F31, 0x1A), new Array(0x3A06, 0x1B), new Array(0x24B4, 0x1C), new Array(0x2183, 0x1D), new Array(0x2EDA, 0x1E), new Array(0x2BED, 0x1F));
  var BITS_SET_IN_HALF_BYTE = new Array(0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4);

  function FormatInformation(formatInfo) {
    this.errorCorrectionLevel = ErrorCorrectionLevel.forBits(formatInfo >> 3 & 0x03);
    this.dataMask = formatInfo & 0x07;

    this.__defineGetter__("ErrorCorrectionLevel", function () {
      return this.errorCorrectionLevel;
    });

    this.__defineGetter__("DataMask", function () {
      return this.dataMask;
    });

    this.GetHashCode = function () {
      return this.errorCorrectionLevel.ordinal() << 3 | this.dataMask;
    };

    this.Equals = function (o) {
      var other = o;
      return this.errorCorrectionLevel == other.errorCorrectionLevel && this.dataMask == other.dataMask;
    };
  }

  FormatInformation.numBitsDiffering = function (a, b) {
    a ^= b; // a now has a 1 bit exactly where its bit differs with b's
    // Count bits set quickly with a series of lookups:

    return BITS_SET_IN_HALF_BYTE[a & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 4) & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 8) & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 12) & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 16) & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 20) & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 24) & 0x0F] + BITS_SET_IN_HALF_BYTE[URShift(a, 28) & 0x0F];
  };

  FormatInformation.decodeFormatInformation = function (maskedFormatInfo) {
    var formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo);

    if (formatInfo != null) {
      return formatInfo;
    } // Should return null, but, some QR codes apparently
    // do not mask this info. Try again by actually masking the pattern
    // first


    return FormatInformation.doDecodeFormatInformation(maskedFormatInfo ^ FORMAT_INFO_MASK_QR);
  };

  FormatInformation.doDecodeFormatInformation = function (maskedFormatInfo) {
    // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
    var bestDifference = 0xffffffff;
    var bestFormatInfo = 0;

    for (var i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++) {
      var decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
      var targetInfo = decodeInfo[0];

      if (targetInfo == maskedFormatInfo) {
        // Found an exact match
        return new FormatInformation(decodeInfo[1]);
      }

      var bitsDifference = this.numBitsDiffering(maskedFormatInfo, targetInfo);

      if (bitsDifference < bestDifference) {
        bestFormatInfo = decodeInfo[1];
        bestDifference = bitsDifference;
      }
    } // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
    // differing means we found a match


    if (bestDifference <= 3) {
      return new FormatInformation(bestFormatInfo);
    }

    return null;
  };

  function ErrorCorrectionLevel(ordinal, bits, name) {
    this.ordinal_Renamed_Field = ordinal;
    this.bits = bits;
    this.name = name;

    this.__defineGetter__("Bits", function () {
      return this.bits;
    });

    this.__defineGetter__("Name", function () {
      return this.name;
    });

    this.ordinal = function () {
      return this.ordinal_Renamed_Field;
    };
  }

  ErrorCorrectionLevel.forBits = function (bits) {
    if (bits < 0 || bits >= FOR_BITS.length) {
      throw "ArgumentException";
    }

    return FOR_BITS[bits];
  };

  var L = new ErrorCorrectionLevel(0, 0x01, "L");
  var M = new ErrorCorrectionLevel(1, 0x00, "M");
  var Q = new ErrorCorrectionLevel(2, 0x03, "Q");
  var H = new ErrorCorrectionLevel(3, 0x02, "H");
  var FOR_BITS = new Array(M, L, H, Q);

  function BitMatrix(width, height) {
    if (!height) height = width;

    if (width < 1 || height < 1) {
      throw "Both dimensions must be greater than 0";
    }

    this.width = width;
    this.height = height;
    var rowSize = width >> 5;

    if ((width & 0x1f) != 0) {
      rowSize++;
    }

    this.rowSize = rowSize;
    this.bits = new Array(rowSize * height);

    for (var i = 0; i < this.bits.length; i++) {
      this.bits[i] = 0;
    }

    this.__defineGetter__("Width", function () {
      return this.width;
    });

    this.__defineGetter__("Height", function () {
      return this.height;
    });

    this.__defineGetter__("Dimension", function () {
      if (this.width != this.height) {
        throw "Can't call getDimension() on a non-square matrix";
      }

      return this.width;
    });

    this.get_Renamed = function (x, y) {
      var offset = y * this.rowSize + (x >> 5);
      return (URShift(this.bits[offset], x & 0x1f) & 1) != 0;
    };

    this.set_Renamed = function (x, y) {
      var offset = y * this.rowSize + (x >> 5);
      this.bits[offset] |= 1 << (x & 0x1f);
    };

    this.flip = function (x, y) {
      var offset = y * this.rowSize + (x >> 5);
      this.bits[offset] ^= 1 << (x & 0x1f);
    };

    this.clear = function () {
      var max = this.bits.length;

      for (var i = 0; i < max; i++) {
        this.bits[i] = 0;
      }
    };

    this.setRegion = function (left, top, width, height) {
      if (top < 0 || left < 0) {
        throw "Left and top must be nonnegative";
      }

      if (height < 1 || width < 1) {
        throw "Height and width must be at least 1";
      }

      var right = left + width;
      var bottom = top + height;

      if (bottom > this.height || right > this.width) {
        throw "The region must fit inside the matrix";
      }

      for (var y = top; y < bottom; y++) {
        var offset = y * this.rowSize;

        for (var x = left; x < right; x++) {
          this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
        }
      }
    };
  }

  function DataBlock(numDataCodewords, codewords) {
    this.numDataCodewords = numDataCodewords;
    this.codewords = codewords;

    this.__defineGetter__("NumDataCodewords", function () {
      return this.numDataCodewords;
    });

    this.__defineGetter__("Codewords", function () {
      return this.codewords;
    });
  }

  DataBlock.getDataBlocks = function (rawCodewords, version, ecLevel) {
    if (rawCodewords.length != version.TotalCodewords) {
      throw "ArgumentException";
    } // Figure out the number and size of data blocks used by this version and
    // error correction level


    var ecBlocks = version.getECBlocksForLevel(ecLevel); // First count the total number of data blocks

    var totalBlocks = 0;
    var ecBlockArray = ecBlocks.getECBlocks();

    for (var i = 0; i < ecBlockArray.length; i++) {
      totalBlocks += ecBlockArray[i].Count;
    } // Now establish DataBlocks of the appropriate size and number of data codewords


    var result = new Array(totalBlocks);
    var numResultBlocks = 0;

    for (var j = 0; j < ecBlockArray.length; j++) {
      var ecBlock = ecBlockArray[j];

      for (var i = 0; i < ecBlock.Count; i++) {
        var numDataCodewords = ecBlock.DataCodewords;
        var numBlockCodewords = ecBlocks.ECCodewordsPerBlock + numDataCodewords;
        result[numResultBlocks++] = new DataBlock(numDataCodewords, new Array(numBlockCodewords));
      }
    } // All blocks have the same amount of data, except that the last n
    // (where n may be 0) have 1 more byte. Figure out where these start.


    var shorterBlocksTotalCodewords = result[0].codewords.length;
    var longerBlocksStartAt = result.length - 1;

    while (longerBlocksStartAt >= 0) {
      var numCodewords = result[longerBlocksStartAt].codewords.length;

      if (numCodewords == shorterBlocksTotalCodewords) {
        break;
      }

      longerBlocksStartAt--;
    }

    longerBlocksStartAt++;
    var shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ECCodewordsPerBlock; // The last elements of result may be 1 element longer;
    // first fill out as many elements as all of them have

    var rawCodewordsOffset = 0;

    for (var i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (var j = 0; j < numResultBlocks; j++) {
        result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
      }
    } // Fill out the last data block in the longer ones


    for (var j = longerBlocksStartAt; j < numResultBlocks; j++) {
      result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
    } // Now add in error correction blocks


    var max = result[0].codewords.length;

    for (var i = shorterBlocksNumDataCodewords; i < max; i++) {
      for (var j = 0; j < numResultBlocks; j++) {
        var iOffset = j < longerBlocksStartAt ? i : i + 1;
        result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
      }
    }

    return result;
  };

  function BitMatrixParser(bitMatrix) {
    var dimension = bitMatrix.Dimension;

    if (dimension < 21 || (dimension & 0x03) != 1) {
      throw "Error BitMatrixParser";
    }

    this.bitMatrix = bitMatrix;
    this.parsedVersion = null;
    this.parsedFormatInfo = null;

    this.copyBit = function (i, j, versionBits) {
      return this.bitMatrix.get_Renamed(i, j) ? versionBits << 1 | 0x1 : versionBits << 1;
    };

    this.readFormatInformation = function () {
      if (this.parsedFormatInfo != null) {
        return this.parsedFormatInfo;
      } // Read top-left format info bits


      var formatInfoBits = 0;

      for (var i = 0; i < 6; i++) {
        formatInfoBits = this.copyBit(i, 8, formatInfoBits);
      } // .. and skip a bit in the timing pattern ...


      formatInfoBits = this.copyBit(7, 8, formatInfoBits);
      formatInfoBits = this.copyBit(8, 8, formatInfoBits);
      formatInfoBits = this.copyBit(8, 7, formatInfoBits); // .. and skip a bit in the timing pattern ...

      for (var j = 5; j >= 0; j--) {
        formatInfoBits = this.copyBit(8, j, formatInfoBits);
      }

      this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);

      if (this.parsedFormatInfo != null) {
        return this.parsedFormatInfo;
      } // Hmm, failed. Try the top-right/bottom-left pattern


      var dimension = this.bitMatrix.Dimension;
      formatInfoBits = 0;
      var iMin = dimension - 8;

      for (var i = dimension - 1; i >= iMin; i--) {
        formatInfoBits = this.copyBit(i, 8, formatInfoBits);
      }

      for (var j = dimension - 7; j < dimension; j++) {
        formatInfoBits = this.copyBit(8, j, formatInfoBits);
      }

      this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);

      if (this.parsedFormatInfo != null) {
        return this.parsedFormatInfo;
      }

      throw "Error readFormatInformation";
    };

    this.readVersion = function () {
      if (this.parsedVersion != null) {
        return this.parsedVersion;
      }

      var dimension = this.bitMatrix.Dimension;
      var provisionalVersion = dimension - 17 >> 2;

      if (provisionalVersion <= 6) {
        return Version.getVersionForNumber(provisionalVersion);
      } // Read top-right version info: 3 wide by 6 tall


      var versionBits = 0;
      var ijMin = dimension - 11;

      for (var j = 5; j >= 0; j--) {
        for (var i = dimension - 9; i >= ijMin; i--) {
          versionBits = this.copyBit(i, j, versionBits);
        }
      }

      this.parsedVersion = Version.decodeVersionInformation(versionBits);

      if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
        return this.parsedVersion;
      } // Hmm, failed. Try bottom left: 6 wide by 3 tall


      versionBits = 0;

      for (var i = 5; i >= 0; i--) {
        for (var j = dimension - 9; j >= ijMin; j--) {
          versionBits = this.copyBit(i, j, versionBits);
        }
      }

      this.parsedVersion = Version.decodeVersionInformation(versionBits);

      if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
        return this.parsedVersion;
      }

      throw "Error readVersion";
    };

    this.readCodewords = function () {
      var formatInfo = this.readFormatInformation();
      var version = this.readVersion(); // Get the data mask for the format used in this QR Code. This will exclude
      // some bits from reading as we wind through the bit matrix.

      var dataMask = DataMask.forReference(formatInfo.DataMask);
      var dimension = this.bitMatrix.Dimension;
      dataMask.unmaskBitMatrix(this.bitMatrix, dimension);
      var functionPattern = version.buildFunctionPattern();
      var readingUp = true;
      var result = new Array(version.TotalCodewords);
      var resultOffset = 0;
      var currentByte = 0;
      var bitsRead = 0; // Read columns in pairs, from right to left

      for (var j = dimension - 1; j > 0; j -= 2) {
        if (j == 6) {
          // Skip whole column with vertical alignment pattern;
          // saves time and makes the other code proceed more cleanly
          j--;
        } // Read alternatingly from bottom to top then top to bottom


        for (var count = 0; count < dimension; count++) {
          var i = readingUp ? dimension - 1 - count : count;

          for (var col = 0; col < 2; col++) {
            // Ignore bits covered by the function pattern
            if (!functionPattern.get_Renamed(j - col, i)) {
              // Read a bit
              bitsRead++;
              currentByte <<= 1;

              if (this.bitMatrix.get_Renamed(j - col, i)) {
                currentByte |= 1;
              } // If we've made a whole byte, save it off


              if (bitsRead == 8) {
                result[resultOffset++] = currentByte;
                bitsRead = 0;
                currentByte = 0;
              }
            }
          }
        }

        readingUp ^= true; // readingUp = !readingUp; // switch directions
      }

      if (resultOffset != version.TotalCodewords) {
        throw "Error readCodewords";
      }

      return result;
    };
  }

  var DataMask = {};

  DataMask.forReference = function (reference) {
    if (reference < 0 || reference > 7) {
      throw "System.ArgumentException";
    }

    return DataMask.DATA_MASKS[reference];
  };

  function DataMask000() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      return (i + j & 0x01) == 0;
    };
  }

  function DataMask001() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      return (i & 0x01) == 0;
    };
  }

  function DataMask010() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      return j % 3 == 0;
    };
  }

  function DataMask011() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      return (i + j) % 3 == 0;
    };
  }

  function DataMask100() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      return (URShift(i, 1) + j / 3 & 0x01) == 0;
    };
  }

  function DataMask101() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      var temp = i * j;
      return (temp & 0x01) + temp % 3 == 0;
    };
  }

  function DataMask110() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      var temp = i * j;
      return ((temp & 0x01) + temp % 3 & 0x01) == 0;
    };
  }

  function DataMask111() {
    this.unmaskBitMatrix = function (bits, dimension) {
      for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
          if (this.isMasked(i, j)) {
            bits.flip(j, i);
          }
        }
      }
    };

    this.isMasked = function (i, j) {
      return ((i + j & 0x01) + i * j % 3 & 0x01) == 0;
    };
  }

  DataMask.DATA_MASKS = new Array(new DataMask000(), new DataMask001(), new DataMask010(), new DataMask011(), new DataMask100(), new DataMask101(), new DataMask110(), new DataMask111());

  function ReedSolomonDecoder(field) {
    this.field = field;

    this.decode = function (received, twoS) {
      var poly = new GF256Poly(this.field, received);
      var syndromeCoefficients = new Array(twoS);

      for (var i = 0; i < syndromeCoefficients.length; i++) {
        syndromeCoefficients[i] = 0;
      }

      var dataMatrix = false; //this.field.Equals(GF256.DATA_MATRIX_FIELD);

      var noError = true;

      for (var i = 0; i < twoS; i++) {
        // Thanks to sanfordsquires for this fix:
        var evalu = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
        syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evalu;

        if (evalu != 0) {
          noError = false;
        }
      }

      if (noError) {
        return;
      }

      var syndrome = new GF256Poly(this.field, syndromeCoefficients);
      var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
      var sigma = sigmaOmega[0];
      var omega = sigmaOmega[1];
      var errorLocations = this.findErrorLocations(sigma);
      var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations, dataMatrix);

      for (var i = 0; i < errorLocations.length; i++) {
        var position = received.length - 1 - this.field.log(errorLocations[i]);

        if (position < 0) {
          throw "ReedSolomonException Bad error location";
        }

        received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
      }
    };

    this.runEuclideanAlgorithm = function (a, b, R) {
      // Assume a's degree is >= b's
      if (a.Degree < b.Degree) {
        var temp = a;
        a = b;
        b = temp;
      }

      var rLast = a;
      var r = b;
      var sLast = this.field.One;
      var s = this.field.Zero;
      var tLast = this.field.Zero;
      var t = this.field.One; // Run Euclidean algorithm until r's degree is less than R/2

      while (r.Degree >= Math.floor(R / 2)) {
        var rLastLast = rLast;
        var sLastLast = sLast;
        var tLastLast = tLast;
        rLast = r;
        sLast = s;
        tLast = t; // Divide rLastLast by rLast, with quotient in q and remainder in r

        if (rLast.Zero) {
          // Oops, Euclidean algorithm already terminated?
          throw "r_{i-1} was zero";
        }

        r = rLastLast;
        var q = this.field.Zero;
        var denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree);
        var dltInverse = this.field.inverse(denominatorLeadingTerm);

        while (r.Degree >= rLast.Degree && !r.Zero) {
          var degreeDiff = r.Degree - rLast.Degree;
          var scale = this.field.multiply(r.getCoefficient(r.Degree), dltInverse);
          q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
          r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale)); //r.EXE();
        }

        s = q.multiply1(sLast).addOrSubtract(sLastLast);
        t = q.multiply1(tLast).addOrSubtract(tLastLast);
      }

      var sigmaTildeAtZero = t.getCoefficient(0);

      if (sigmaTildeAtZero == 0) {
        throw "ReedSolomonException sigmaTilde(0) was zero";
      }

      var inverse = this.field.inverse(sigmaTildeAtZero);
      var sigma = t.multiply2(inverse);
      var omega = r.multiply2(inverse);
      return new Array(sigma, omega);
    };

    this.findErrorLocations = function (errorLocator) {
      // This is a direct application of Chien's search
      var numErrors = errorLocator.Degree;

      if (numErrors == 1) {
        // shortcut
        return new Array(errorLocator.getCoefficient(1));
      }

      var result = new Array(numErrors);
      var e = 0;

      for (var i = 1; i < 256 && e < numErrors; i++) {
        if (errorLocator.evaluateAt(i) == 0) {
          result[e] = this.field.inverse(i);
          e++;
        }
      }

      if (e != numErrors) {
        throw "Error locator degree does not match number of roots";
      }

      return result;
    };

    this.findErrorMagnitudes = function (errorEvaluator, errorLocations, dataMatrix) {
      // This is directly applying Forney's Formula
      var s = errorLocations.length;
      var result = new Array(s);

      for (var i = 0; i < s; i++) {
        var xiInverse = this.field.inverse(errorLocations[i]);
        var denominator = 1;

        for (var j = 0; j < s; j++) {
          if (i != j) {
            denominator = this.field.multiply(denominator, GF256.addOrSubtract(1, this.field.multiply(errorLocations[j], xiInverse)));
          }
        }

        result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator)); // Thanks to sanfordsquires for this fix:

        if (dataMatrix) {
          result[i] = this.field.multiply(result[i], xiInverse);
        }
      }

      return result;
    };
  }

  function GF256Poly(field, coefficients) {
    if (coefficients == null || coefficients.length == 0) {
      throw "System.ArgumentException";
    }

    this.field = field;
    var coefficientsLength = coefficients.length;

    if (coefficientsLength > 1 && coefficients[0] == 0) {
      // Leading term must be non-zero for anything except the constant polynomial "0"
      var firstNonZero = 1;

      while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0) {
        firstNonZero++;
      }

      if (firstNonZero == coefficientsLength) {
        this.coefficients = field.Zero.coefficients;
      } else {
        this.coefficients = new Array(coefficientsLength - firstNonZero);

        for (var i = 0; i < this.coefficients.length; i++) {
          this.coefficients[i] = 0;
        } //Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);


        for (var ci = 0; ci < this.coefficients.length; ci++) {
          this.coefficients[ci] = coefficients[firstNonZero + ci];
        }
      }
    } else {
      this.coefficients = coefficients;
    }

    this.__defineGetter__("Zero", function () {
      return this.coefficients[0] == 0;
    });

    this.__defineGetter__("Degree", function () {
      return this.coefficients.length - 1;
    });

    this.__defineGetter__("Coefficients", function () {
      return this.coefficients;
    });

    this.getCoefficient = function (degree) {
      return this.coefficients[this.coefficients.length - 1 - degree];
    };

    this.evaluateAt = function (a) {
      if (a == 0) {
        // Just return the x^0 coefficient
        return this.getCoefficient(0);
      }

      var size = this.coefficients.length;

      if (a == 1) {
        // Just the sum of the coefficients
        var result = 0;

        for (var i = 0; i < size; i++) {
          result = GF256.addOrSubtract(result, this.coefficients[i]);
        }

        return result;
      }

      var result2 = this.coefficients[0];

      for (var i = 1; i < size; i++) {
        result2 = GF256.addOrSubtract(this.field.multiply(a, result2), this.coefficients[i]);
      }

      return result2;
    };

    this.addOrSubtract = function (other) {
      if (this.field != other.field) {
        throw "GF256Polys do not have same GF256 field";
      }

      if (this.Zero) {
        return other;
      }

      if (other.Zero) {
        return this;
      }

      var smallerCoefficients = this.coefficients;
      var largerCoefficients = other.coefficients;

      if (smallerCoefficients.length > largerCoefficients.length) {
        var temp = smallerCoefficients;
        smallerCoefficients = largerCoefficients;
        largerCoefficients = temp;
      }

      var sumDiff = new Array(largerCoefficients.length);
      var lengthDiff = largerCoefficients.length - smallerCoefficients.length; // Copy high-order terms only found in higher-degree polynomial's coefficients
      //Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);

      for (var ci = 0; ci < lengthDiff; ci++) {
        sumDiff[ci] = largerCoefficients[ci];
      }

      for (var i = lengthDiff; i < largerCoefficients.length; i++) {
        sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
      }

      return new GF256Poly(field, sumDiff);
    };

    this.multiply1 = function (other) {
      if (this.field != other.field) {
        throw "GF256Polys do not have same GF256 field";
      }

      if (this.Zero || other.Zero) {
        return this.field.Zero;
      }

      var aCoefficients = this.coefficients;
      var aLength = aCoefficients.length;
      var bCoefficients = other.coefficients;
      var bLength = bCoefficients.length;
      var product = new Array(aLength + bLength - 1);

      for (var i = 0; i < aLength; i++) {
        var aCoeff = aCoefficients[i];

        for (var j = 0; j < bLength; j++) {
          product[i + j] = GF256.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
        }
      }

      return new GF256Poly(this.field, product);
    };

    this.multiply2 = function (scalar) {
      if (scalar == 0) {
        return this.field.Zero;
      }

      if (scalar == 1) {
        return this;
      }

      var size = this.coefficients.length;
      var product = new Array(size);

      for (var i = 0; i < size; i++) {
        product[i] = this.field.multiply(this.coefficients[i], scalar);
      }

      return new GF256Poly(this.field, product);
    };

    this.multiplyByMonomial = function (degree, coefficient) {
      if (degree < 0) {
        throw "System.ArgumentException";
      }

      if (coefficient == 0) {
        return this.field.Zero;
      }

      var size = this.coefficients.length;
      var product = new Array(size + degree);

      for (var i = 0; i < product.length; i++) {
        product[i] = 0;
      }

      for (var i = 0; i < size; i++) {
        product[i] = this.field.multiply(this.coefficients[i], coefficient);
      }

      return new GF256Poly(this.field, product);
    };

    this.divide = function (other) {
      if (this.field != other.field) {
        throw "GF256Polys do not have same GF256 field";
      }

      if (other.Zero) {
        throw "Divide by 0";
      }

      var quotient = this.field.Zero;
      var remainder = this;
      var denominatorLeadingTerm = other.getCoefficient(other.Degree);
      var inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);

      while (remainder.Degree >= other.Degree && !remainder.Zero) {
        var degreeDifference = remainder.Degree - other.Degree;
        var scale = this.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm);
        var term = other.multiplyByMonomial(degreeDifference, scale);
        var iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
        quotient = quotient.addOrSubtract(iterationQuotient);
        remainder = remainder.addOrSubtract(term);
      }

      return new Array(quotient, remainder);
    };
  }

  function GF256(primitive) {
    this.expTable = new Array(256);
    this.logTable = new Array(256);
    var x = 1;

    for (var i = 0; i < 256; i++) {
      this.expTable[i] = x;
      x <<= 1; // x = x * 2; we're assuming the generator alpha is 2

      if (x >= 0x100) {
        x ^= primitive;
      }
    }

    for (var i = 0; i < 255; i++) {
      this.logTable[this.expTable[i]] = i;
    } // logTable[0] == 0 but this should never be used


    var at0 = new Array(1);
    at0[0] = 0;
    this.zero = new GF256Poly(this, new Array(at0));
    var at1 = new Array(1);
    at1[0] = 1;
    this.one = new GF256Poly(this, new Array(at1));

    this.__defineGetter__("Zero", function () {
      return this.zero;
    });

    this.__defineGetter__("One", function () {
      return this.one;
    });

    this.buildMonomial = function (degree, coefficient) {
      if (degree < 0) {
        throw "System.ArgumentException";
      }

      if (coefficient == 0) {
        return this.zero;
      }

      var coefficients = new Array(degree + 1);

      for (var i = 0; i < coefficients.length; i++) {
        coefficients[i] = 0;
      }

      coefficients[0] = coefficient;
      return new GF256Poly(this, coefficients);
    };

    this.exp = function (a) {
      return this.expTable[a];
    };

    this.log = function (a) {
      if (a == 0) {
        throw "System.ArgumentException";
      }

      return this.logTable[a];
    };

    this.inverse = function (a) {
      if (a == 0) {
        throw "System.ArithmeticException";
      }

      return this.expTable[255 - this.logTable[a]];
    };

    this.multiply = function (a, b) {
      if (a == 0 || b == 0) {
        return 0;
      }

      if (a == 1) {
        return b;
      }

      if (b == 1) {
        return a;
      }

      return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
    };
  }

  GF256.QR_CODE_FIELD = new GF256(0x011D);
  GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

  GF256.addOrSubtract = function (a, b) {
    return a ^ b;
  };

  var Decoder = {};
  Decoder.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);

  Decoder.correctErrors = function (codewordBytes, numDataCodewords) {
    var numCodewords = codewordBytes.length; // First read into an array of ints

    var codewordsInts = new Array(numCodewords);

    for (var i = 0; i < numCodewords; i++) {
      codewordsInts[i] = codewordBytes[i] & 0xFF;
    }

    var numECCodewords = codewordBytes.length - numDataCodewords;

    try {
      Decoder.rsDecoder.decode(codewordsInts, numECCodewords); //var corrector = new ReedSolomon(codewordsInts, numECCodewords);
      //corrector.correct();
    } catch (rse) {
      throw rse;
    } // Copy back into array of bytes -- only need to worry about the bytes that were data
    // We don't care about errors in the error-correction codewords


    for (var i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  };

  Decoder.decode = function (bits) {
    var parser = new BitMatrixParser(bits);
    var version = parser.readVersion();
    var ecLevel = parser.readFormatInformation().ErrorCorrectionLevel; // Read codewords

    var codewords = parser.readCodewords(); // Separate into data blocks

    var dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel); // Count total number of data bytes

    var totalBytes = 0;

    for (var i = 0; i < dataBlocks.length; i++) {
      totalBytes += dataBlocks[i].NumDataCodewords;
    }

    var resultBytes = new Array(totalBytes);
    var resultOffset = 0; // Error-correct and copy data blocks together into a stream of bytes

    for (var j = 0; j < dataBlocks.length; j++) {
      var dataBlock = dataBlocks[j];
      var codewordBytes = dataBlock.Codewords;
      var numDataCodewords = dataBlock.NumDataCodewords;
      Decoder.correctErrors(codewordBytes, numDataCodewords);

      for (var i = 0; i < numDataCodewords; i++) {
        resultBytes[resultOffset++] = codewordBytes[i];
      }
    } // Decode the contents of that stream of bytes


    var reader = new QRCodeDataBlockReader(resultBytes, version.VersionNumber, ecLevel.Bits);
    return reader; //return DecodedBitStreamParser.decode(resultBytes, version, ecLevel);
  };

  var qrcode = {};
  qrcode.imagedata = null;
  qrcode.width = 0;
  qrcode.height = 0;
  qrcode.qrCodeSymbol = null;
  qrcode.debug = false;
  qrcode.maxImgSize = 1024 * 1024;
  qrcode.sizeOfDataLengthInfo = [[10, 9, 8, 8], [12, 11, 16, 10], [14, 13, 16, 12]];
  qrcode.callback = null;

  qrcode.vidSuccess = function (stream) {
    qrcode.localstream = stream;
    if (qrcode.webkit) qrcode.video.src = window.webkitURL.createObjectURL(stream);else if (qrcode.moz) {
      qrcode.video.mozSrcObject = stream;
      qrcode.video.play();
    } else qrcode.video.src = stream;
    qrcode.gUM = true;
    qrcode.canvas_qr2 = document.createElement('canvas');
    qrcode.canvas_qr2.id = "qr-canvas";
    qrcode.qrcontext2 = qrcode.canvas_qr2.getContext('2d');
    qrcode.canvas_qr2.width = qrcode.video.videoWidth;
    qrcode.canvas_qr2.height = qrcode.video.videoHeight;
    setTimeout(qrcode.captureToCanvas, 500);
  };

  qrcode.vidError = function (error) {
    qrcode.gUM = false;
    return;
  };

  qrcode.captureToCanvas = function () {
    if (qrcode.gUM) {
      try {
        if (qrcode.video.videoWidth == 0) {
          setTimeout(qrcode.captureToCanvas, 500);
          return;
        } else {
          qrcode.canvas_qr2.width = qrcode.video.videoWidth;
          qrcode.canvas_qr2.height = qrcode.video.videoHeight;
        }

        qrcode.qrcontext2.drawImage(qrcode.video, 0, 0);

        try {
          qrcode.decode();
        } catch (e) {
          console.log(e);
          setTimeout(qrcode.captureToCanvas, 500);
        }

        ;
      } catch (e) {
        console.log(e);
        setTimeout(qrcode.captureToCanvas, 500);
      }

      ;
    }
  };

  qrcode.setWebcam = function (videoId) {
    var n = navigator;
    qrcode.video = document.getElementById(videoId);
    var options = true;

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
          devices.forEach(function (device) {
            console.log("deb1");

            if (device.kind === 'videoinput') {
              if (device.label.toLowerCase().search("back") > -1) options = [{
                'sourceId': device.deviceId
              }];
            }

            console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
          });
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("no navigator.mediaDevices.enumerateDevices");
    }

    if (n.getUserMedia) n.getUserMedia({
      video: options,
      audio: false
    }, qrcode.vidSuccess, qrcode.vidError);else if (n.webkitGetUserMedia) {
      qrcode.webkit = true;
      n.webkitGetUserMedia({
        video: options,
        audio: false
      }, qrcode.vidSuccess, qrcode.vidError);
    } else if (n.mozGetUserMedia) {
      qrcode.moz = true;
      n.mozGetUserMedia({
        video: options,
        audio: false
      }, qrcode.vidSuccess, qrcode.vidError);
    }
  };

  qrcode.decode = function (src) {
    if (arguments.length == 0) {
      if (qrcode.canvas_qr2) {
        var canvas_qr = qrcode.canvas_qr2;
        var context = qrcode.qrcontext2;
      } else {
        var canvas_qr = document.getElementById("qr-canvas");
        var context = canvas_qr.getContext('2d');
      }

      qrcode.width = canvas_qr.width;
      qrcode.height = canvas_qr.height;
      qrcode.imagedata = context.getImageData(0, 0, qrcode.width, qrcode.height);
      qrcode.result = qrcode.process(context);
      if (qrcode.callback != null) qrcode.callback(qrcode.result);
      return qrcode.result;
    } else {
      var image = new Image();
      image.crossOrigin = "Anonymous";

      image.onload = function () {
        //var canvas_qr = document.getElementById("qr-canvas");
        var canvas_out = document.getElementById("out-canvas");

        if (canvas_out != null) {
          var outctx = canvas_out.getContext('2d');
          outctx.clearRect(0, 0, 320, 240);
          outctx.drawImage(image, 0, 0, 320, 240);
        }

        var canvas_qr = document.createElement('canvas');
        var context = canvas_qr.getContext('2d');
        var nheight = image.height;
        var nwidth = image.width;

        if (image.width * image.height > qrcode.maxImgSize) {
          var ir = image.width / image.height;
          nheight = Math.sqrt(qrcode.maxImgSize / ir);
          nwidth = ir * nheight;
        }

        canvas_qr.width = nwidth;
        canvas_qr.height = nheight;
        context.drawImage(image, 0, 0, canvas_qr.width, canvas_qr.height);
        qrcode.width = canvas_qr.width;
        qrcode.height = canvas_qr.height;

        try {
          qrcode.imagedata = context.getImageData(0, 0, canvas_qr.width, canvas_qr.height);
        } catch (e) {
          qrcode.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
          if (qrcode.callback != null) qrcode.callback(qrcode.result);
          return;
        }

        try {
          qrcode.result = qrcode.process(context);
        } catch (e) {
          console.log(e);
          qrcode.result = "error decoding QR Code";
        }

        if (qrcode.callback != null) qrcode.callback(qrcode.result);
      };

      image.onerror = function () {
        if (qrcode.callback != null) qrcode.callback("Failed to load the image");
      };

      image.src = src;
    }
  };

  qrcode.isUrl = function (s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  };

  qrcode.decode_url = function (s) {
    var escaped = "";

    try {
      escaped = escape(s);
    } catch (e) {
      console.log(e);
      escaped = s;
    }

    var ret = "";

    try {
      ret = decodeURIComponent(escaped);
    } catch (e) {
      console.log(e);
      ret = escaped;
    }

    return ret;
  };

  qrcode.decode_utf8 = function (s) {
    if (qrcode.isUrl(s)) return qrcode.decode_url(s);else return s;
  };

  qrcode.process = function (ctx) {
    var start = new Date().getTime();
    var image = qrcode.grayScaleToBitmap(qrcode.grayscale()); //var image = qrcode.binarize(128);

    if (qrcode.debug) {
      for (var y = 0; y < qrcode.height; y++) {
        for (var x = 0; x < qrcode.width; x++) {
          var point = x * 4 + y * qrcode.width * 4;
          qrcode.imagedata.data[point] = image[x + y * qrcode.width] ? 0 : 0;
          qrcode.imagedata.data[point + 1] = image[x + y * qrcode.width] ? 0 : 0;
          qrcode.imagedata.data[point + 2] = image[x + y * qrcode.width] ? 255 : 0;
        }
      }

      ctx.putImageData(qrcode.imagedata, 0, 0);
    } //var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);


    var detector = new Detector(image);
    var qRCodeMatrix = detector.detect();

    if (qrcode.debug) {
      for (var y = 0; y < qRCodeMatrix.bits.Height; y++) {
        for (var x = 0; x < qRCodeMatrix.bits.Width; x++) {
          var point = x * 4 * 2 + y * 2 * qrcode.width * 4;
          qrcode.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x, y) ? 0 : 0;
          qrcode.imagedata.data[point + 1] = qRCodeMatrix.bits.get_Renamed(x, y) ? 0 : 0;
          qrcode.imagedata.data[point + 2] = qRCodeMatrix.bits.get_Renamed(x, y) ? 255 : 0;
        }
      }

      ctx.putImageData(qrcode.imagedata, 0, 0);
    }

    var reader = Decoder.decode(qRCodeMatrix.bits);
    var data = reader.DataByte;
    var str = "";

    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        str += String.fromCharCode(data[i][j]);
      }
    }

    var end = new Date().getTime();
    var time = end - start;
    console.log(time);
    return qrcode.decode_utf8(str); //alert("Time:" + time + " Code: "+str);
  };

  qrcode.getPixel = function (x, y) {
    if (qrcode.width < x) {
      throw "point error";
    }

    if (qrcode.height < y) {
      throw "point error";
    }

    var point = x * 4 + y * qrcode.width * 4;
    var p = (qrcode.imagedata.data[point] * 33 + qrcode.imagedata.data[point + 1] * 34 + qrcode.imagedata.data[point + 2] * 33) / 100;
    return p;
  };

  qrcode.binarize = function (th) {
    var ret = new Array(qrcode.width * qrcode.height);

    for (var y = 0; y < qrcode.height; y++) {
      for (var x = 0; x < qrcode.width; x++) {
        var gray = qrcode.getPixel(x, y);
        ret[x + y * qrcode.width] = gray <= th ? true : false;
      }
    }

    return ret;
  };

  qrcode.getMiddleBrightnessPerArea = function (image) {
    var numSqrtArea = 4; //obtain middle brightness((min + max) / 2) per area

    var areaWidth = Math.floor(qrcode.width / numSqrtArea);
    var areaHeight = Math.floor(qrcode.height / numSqrtArea);
    var minmax = new Array(numSqrtArea);

    for (var i = 0; i < numSqrtArea; i++) {
      minmax[i] = new Array(numSqrtArea);

      for (var i2 = 0; i2 < numSqrtArea; i2++) {
        minmax[i][i2] = new Array(0, 0);
      }
    }

    for (var ay = 0; ay < numSqrtArea; ay++) {
      for (var ax = 0; ax < numSqrtArea; ax++) {
        minmax[ax][ay][0] = 0xFF;

        for (var dy = 0; dy < areaHeight; dy++) {
          for (var dx = 0; dx < areaWidth; dx++) {
            var target = image[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width];
            if (target < minmax[ax][ay][0]) minmax[ax][ay][0] = target;
            if (target > minmax[ax][ay][1]) minmax[ax][ay][1] = target;
          }
        } //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;

      }
    }

    var middle = new Array(numSqrtArea);

    for (var i3 = 0; i3 < numSqrtArea; i3++) {
      middle[i3] = new Array(numSqrtArea);
    }

    for (var ay = 0; ay < numSqrtArea; ay++) {
      for (var ax = 0; ax < numSqrtArea; ax++) {
        middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2); //Console.out.print(middle[ax][ay] + ",");
      } //Console.out.println("");

    } //Console.out.println("");


    return middle;
  };

  qrcode.grayScaleToBitmap = function (grayScale) {
    var middle = qrcode.getMiddleBrightnessPerArea(grayScale);
    var sqrtNumArea = middle.length;
    var areaWidth = Math.floor(qrcode.width / sqrtNumArea);
    var areaHeight = Math.floor(qrcode.height / sqrtNumArea);
    var buff = new ArrayBuffer(qrcode.width * qrcode.height);
    var bitmap = new Uint8Array(buff); //var bitmap = new Array(qrcode.height*qrcode.width);

    for (var ay = 0; ay < sqrtNumArea; ay++) {
      for (var ax = 0; ax < sqrtNumArea; ax++) {
        for (var dy = 0; dy < areaHeight; dy++) {
          for (var dx = 0; dx < areaWidth; dx++) {
            bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width] = grayScale[areaWidth * ax + dx + (areaHeight * ay + dy) * qrcode.width] < middle[ax][ay] ? true : false;
          }
        }
      }
    }

    return bitmap;
  };

  qrcode.grayscale = function () {
    var buff = new ArrayBuffer(qrcode.width * qrcode.height);
    var ret = new Uint8Array(buff); //var ret = new Array(qrcode.width*qrcode.height);

    for (var y = 0; y < qrcode.height; y++) {
      for (var x = 0; x < qrcode.width; x++) {
        var gray = qrcode.getPixel(x, y);
        ret[x + y * qrcode.width] = gray;
      }
    }

    return ret;
  };

  function URShift(number, bits) {
    if (number >= 0) return number >> bits;else return (number >> bits) + (2 << ~bits);
  }

  var MIN_SKIP = 3;
  var MAX_MODULES = 57;
  var INTEGER_MATH_SHIFT = 8;
  var CENTER_QUORUM = 2;

  qrcode.orderBestPatterns = function (patterns) {
    function distance(pattern1, pattern2) {
      var xDiff = pattern1.X - pattern2.X;
      var yDiff = pattern1.Y - pattern2.Y;
      return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    } /// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>


    function crossProductZ(pointA, pointB, pointC) {
      var bX = pointB.x;
      var bY = pointB.y;
      return (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX);
    } // Find distances between pattern centers


    var zeroOneDistance = distance(patterns[0], patterns[1]);
    var oneTwoDistance = distance(patterns[1], patterns[2]);
    var zeroTwoDistance = distance(patterns[0], patterns[2]);
    var pointA, pointB, pointC; // Assume one closest to other two is B; A and C will just be guesses at first

    if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
      pointB = patterns[0];
      pointA = patterns[1];
      pointC = patterns[2];
    } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
      pointB = patterns[1];
      pointA = patterns[0];
      pointC = patterns[2];
    } else {
      pointB = patterns[2];
      pointA = patterns[0];
      pointC = patterns[1];
    } // Use cross product to figure out whether A and C are correct or flipped.
    // This asks whether BC x BA has a positive z component, which is the arrangement
    // we want for A, B, C. If it's negative, then we've got it flipped around and
    // should swap A and C.


    if (crossProductZ(pointA, pointB, pointC) < 0.0) {
      var temp = pointA;
      pointA = pointC;
      pointC = temp;
    }

    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  };

  function FinderPattern(posX, posY, estimatedModuleSize) {
    this.x = posX;
    this.y = posY;
    this.count = 1;
    this.estimatedModuleSize = estimatedModuleSize;

    this.__defineGetter__("EstimatedModuleSize", function () {
      return this.estimatedModuleSize;
    });

    this.__defineGetter__("Count", function () {
      return this.count;
    });

    this.__defineGetter__("X", function () {
      return this.x;
    });

    this.__defineGetter__("Y", function () {
      return this.y;
    });

    this.incrementCount = function () {
      this.count++;
    };

    this.aboutEquals = function (moduleSize, i, j) {
      if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
        var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
        return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
      }

      return false;
    };
  }

  function FinderPatternInfo(patternCenters) {
    this.bottomLeft = patternCenters[0];
    this.topLeft = patternCenters[1];
    this.topRight = patternCenters[2];

    this.__defineGetter__("BottomLeft", function () {
      return this.bottomLeft;
    });

    this.__defineGetter__("TopLeft", function () {
      return this.topLeft;
    });

    this.__defineGetter__("TopRight", function () {
      return this.topRight;
    });
  }

  function FinderPatternFinder() {
    this.image = null;
    this.possibleCenters = [];
    this.hasSkipped = false;
    this.crossCheckStateCount = new Array(0, 0, 0, 0, 0);
    this.resultPointCallback = null;

    this.__defineGetter__("CrossCheckStateCount", function () {
      this.crossCheckStateCount[0] = 0;
      this.crossCheckStateCount[1] = 0;
      this.crossCheckStateCount[2] = 0;
      this.crossCheckStateCount[3] = 0;
      this.crossCheckStateCount[4] = 0;
      return this.crossCheckStateCount;
    });

    this.foundPatternCross = function (stateCount) {
      var totalModuleSize = 0;

      for (var i = 0; i < 5; i++) {
        var count = stateCount[i];

        if (count == 0) {
          return false;
        }

        totalModuleSize += count;
      }

      if (totalModuleSize < 7) {
        return false;
      }

      var moduleSize = Math.floor((totalModuleSize << INTEGER_MATH_SHIFT) / 7);
      var maxVariance = Math.floor(moduleSize / 2); // Allow less than 50% variance from 1-1-3-1-1 proportions

      return Math.abs(moduleSize - (stateCount[0] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2] << INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4] << INTEGER_MATH_SHIFT)) < maxVariance;
    };

    this.centerFromEnd = function (stateCount, end) {
      return end - stateCount[4] - stateCount[3] - stateCount[2] / 2.0;
    };

    this.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
      var image = this.image;
      var maxI = qrcode.height;
      var stateCount = this.CrossCheckStateCount; // Start counting up from center

      var i = startI;

      while (i >= 0 && image[centerJ + i * qrcode.width]) {
        stateCount[2]++;
        i--;
      }

      if (i < 0) {
        return NaN;
      }

      while (i >= 0 && !image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
        stateCount[1]++;
        i--;
      } // If already too many modules in this state or ran off the edge:


      if (i < 0 || stateCount[1] > maxCount) {
        return NaN;
      }

      while (i >= 0 && image[centerJ + i * qrcode.width] && stateCount[0] <= maxCount) {
        stateCount[0]++;
        i--;
      }

      if (stateCount[0] > maxCount) {
        return NaN;
      } // Now also count down from center


      i = startI + 1;

      while (i < maxI && image[centerJ + i * qrcode.width]) {
        stateCount[2]++;
        i++;
      }

      if (i == maxI) {
        return NaN;
      }

      while (i < maxI && !image[centerJ + i * qrcode.width] && stateCount[3] < maxCount) {
        stateCount[3]++;
        i++;
      }

      if (i == maxI || stateCount[3] >= maxCount) {
        return NaN;
      }

      while (i < maxI && image[centerJ + i * qrcode.width] && stateCount[4] < maxCount) {
        stateCount[4]++;
        i++;
      }

      if (stateCount[4] >= maxCount) {
        return NaN;
      } // If we found a finder-pattern-like section, but its size is more than 40% different than
      // the original, assume it's a false positive


      var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

      if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
        return NaN;
      }

      return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
    };

    this.crossCheckHorizontal = function (startJ, centerI, maxCount, originalStateCountTotal) {
      var image = this.image;
      var maxJ = qrcode.width;
      var stateCount = this.CrossCheckStateCount;
      var j = startJ;

      while (j >= 0 && image[j + centerI * qrcode.width]) {
        stateCount[2]++;
        j--;
      }

      if (j < 0) {
        return NaN;
      }

      while (j >= 0 && !image[j + centerI * qrcode.width] && stateCount[1] <= maxCount) {
        stateCount[1]++;
        j--;
      }

      if (j < 0 || stateCount[1] > maxCount) {
        return NaN;
      }

      while (j >= 0 && image[j + centerI * qrcode.width] && stateCount[0] <= maxCount) {
        stateCount[0]++;
        j--;
      }

      if (stateCount[0] > maxCount) {
        return NaN;
      }

      j = startJ + 1;

      while (j < maxJ && image[j + centerI * qrcode.width]) {
        stateCount[2]++;
        j++;
      }

      if (j == maxJ) {
        return NaN;
      }

      while (j < maxJ && !image[j + centerI * qrcode.width] && stateCount[3] < maxCount) {
        stateCount[3]++;
        j++;
      }

      if (j == maxJ || stateCount[3] >= maxCount) {
        return NaN;
      }

      while (j < maxJ && image[j + centerI * qrcode.width] && stateCount[4] < maxCount) {
        stateCount[4]++;
        j++;
      }

      if (stateCount[4] >= maxCount) {
        return NaN;
      } // If we found a finder-pattern-like section, but its size is significantly different than
      // the original, assume it's a false positive


      var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

      if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
        return NaN;
      }

      return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, j) : NaN;
    };

    this.handlePossibleCenter = function (stateCount, i, j) {
      var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
      var centerJ = this.centerFromEnd(stateCount, j); //float

      var centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal); //float

      if (!isNaN(centerI)) {
        // Re-cross check
        centerJ = this.crossCheckHorizontal(Math.floor(centerJ), Math.floor(centerI), stateCount[2], stateCountTotal);

        if (!isNaN(centerJ)) {
          var estimatedModuleSize = stateCountTotal / 7.0;
          var found = false;
          var max = this.possibleCenters.length;

          for (var index = 0; index < max; index++) {
            var center = this.possibleCenters[index]; // Look for about the same center and module size:

            if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
              center.incrementCount();
              found = true;
              break;
            }
          }

          if (!found) {
            var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
            this.possibleCenters.push(point);

            if (this.resultPointCallback != null) {
              this.resultPointCallback.foundPossibleResultPoint(point);
            }
          }

          return true;
        }
      }

      return false;
    };

    this.selectBestPatterns = function () {
      var startSize = this.possibleCenters.length;

      if (startSize < 3) {
        // Couldn't find enough finder patterns
        throw "Couldn't find enough finder patterns (found " + startSize + ")";
      } // Filter outlier possibilities whose module size is too different


      if (startSize > 3) {
        // But we can only afford to do so if we have at least 4 possibilities to choose from
        var totalModuleSize = 0.0;
        var square = 0.0;

        for (var i = 0; i < startSize; i++) {
          //totalModuleSize +=  this.possibleCenters[i].EstimatedModuleSize;
          var centerValue = this.possibleCenters[i].EstimatedModuleSize;
          totalModuleSize += centerValue;
          square += centerValue * centerValue;
        }

        var average = totalModuleSize / startSize;
        this.possibleCenters.sort(function (center1, center2) {
          var dA = Math.abs(center2.EstimatedModuleSize - average);
          var dB = Math.abs(center1.EstimatedModuleSize - average);

          if (dA < dB) {
            return -1;
          } else if (dA == dB) {
            return 0;
          } else {
            return 1;
          }
        });
        var stdDev = Math.sqrt(square / startSize - average * average);
        var limit = Math.max(0.2 * average, stdDev); //for (var i = 0; i < this.possibleCenters.length && this.possibleCenters.length > 3; i++)

        for (var i = this.possibleCenters.length - 1; i >= 0; i--) {
          var pattern = this.possibleCenters[i]; //if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)

          if (Math.abs(pattern.EstimatedModuleSize - average) > limit) {
            //this.possibleCenters.remove(i);
            this.possibleCenters.splice(i, 1); //i--;
          }
        }
      }

      if (this.possibleCenters.length > 3) {
        // Throw away all but those first size candidate points we found.
        this.possibleCenters.sort(function (a, b) {
          if (a.count > b.count) {
            return -1;
          }

          if (a.count < b.count) {
            return 1;
          }

          return 0;
        });
      }

      return new Array(this.possibleCenters[0], this.possibleCenters[1], this.possibleCenters[2]);
    };

    this.findRowSkip = function () {
      var max = this.possibleCenters.length;

      if (max <= 1) {
        return 0;
      }

      var firstConfirmedCenter = null;

      for (var i = 0; i < max; i++) {
        var center = this.possibleCenters[i];

        if (center.Count >= CENTER_QUORUM) {
          if (firstConfirmedCenter == null) {
            firstConfirmedCenter = center;
          } else {
            // We have two confirmed centers
            // How far down can we skip before resuming looking for the next
            // pattern? In the worst case, only the difference between the
            // difference in the x / y coordinates of the two centers.
            // This is the case where you find top left last.
            this.hasSkipped = true;
            return Math.floor((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
          }
        }
      }

      return 0;
    };

    this.haveMultiplyConfirmedCenters = function () {
      var confirmedCount = 0;
      var totalModuleSize = 0.0;
      var max = this.possibleCenters.length;

      for (var i = 0; i < max; i++) {
        var pattern = this.possibleCenters[i];

        if (pattern.Count >= CENTER_QUORUM) {
          confirmedCount++;
          totalModuleSize += pattern.EstimatedModuleSize;
        }
      }

      if (confirmedCount < 3) {
        return false;
      } // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
      // and that we need to keep looking. We detect this by asking if the estimated module sizes
      // vary too much. We arbitrarily say that when the total deviation from average exceeds
      // 5% of the total module size estimates, it's too much.


      var average = totalModuleSize / max;
      var totalDeviation = 0.0;

      for (var i = 0; i < max; i++) {
        pattern = this.possibleCenters[i];
        totalDeviation += Math.abs(pattern.EstimatedModuleSize - average);
      }

      return totalDeviation <= 0.05 * totalModuleSize;
    };

    this.findFinderPattern = function (image) {
      var tryHarder = false;
      this.image = image;
      var maxI = qrcode.height;
      var maxJ = qrcode.width;
      var iSkip = Math.floor(3 * maxI / (4 * MAX_MODULES));

      if (iSkip < MIN_SKIP || tryHarder) {
        iSkip = MIN_SKIP;
      }

      var done = false;
      var stateCount = new Array(5);

      for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
        // Get a row of black/white values
        stateCount[0] = 0;
        stateCount[1] = 0;
        stateCount[2] = 0;
        stateCount[3] = 0;
        stateCount[4] = 0;
        var currentState = 0;

        for (var j = 0; j < maxJ; j++) {
          if (image[j + i * qrcode.width]) {
            // Black pixel
            if ((currentState & 1) == 1) {
              // Counting white pixels
              currentState++;
            }

            stateCount[currentState]++;
          } else {
            // White pixel
            if ((currentState & 1) == 0) {
              // Counting black pixels
              if (currentState == 4) {
                // A winner?
                if (this.foundPatternCross(stateCount)) {
                  // Yes
                  var confirmed = this.handlePossibleCenter(stateCount, i, j);

                  if (confirmed) {
                    // Start examining every other line. Checking each line turned out to be too
                    // expensive and didn't improve performance.
                    iSkip = 2;

                    if (this.hasSkipped) {
                      done = this.haveMultiplyConfirmedCenters();
                    } else {
                      var rowSkip = this.findRowSkip();

                      if (rowSkip > stateCount[2]) {
                        // Skip rows between row of lower confirmed center
                        // and top of presumed third confirmed center
                        // but back up a bit to get a full chance of detecting
                        // it, entire width of center of finder pattern
                        // Skip by rowSkip, but back off by stateCount[2] (size of last center
                        // of pattern we saw) to be conservative, and also back off by iSkip which
                        // is about to be re-added
                        i += rowSkip - stateCount[2] - iSkip;
                        j = maxJ - 1;
                      }
                    }
                  } else {
                    // Advance to next black pixel
                    do {
                      j++;
                    } while (j < maxJ && !image[j + i * qrcode.width]);

                    j--; // back up to that last white pixel
                  } // Clear state to start looking again


                  currentState = 0;
                  stateCount[0] = 0;
                  stateCount[1] = 0;
                  stateCount[2] = 0;
                  stateCount[3] = 0;
                  stateCount[4] = 0;
                } else {
                  // No, shift counts back by two
                  stateCount[0] = stateCount[2];
                  stateCount[1] = stateCount[3];
                  stateCount[2] = stateCount[4];
                  stateCount[3] = 1;
                  stateCount[4] = 0;
                  currentState = 3;
                }
              } else {
                stateCount[++currentState]++;
              }
            } else {
              // Counting white pixels
              stateCount[currentState]++;
            }
          }
        }

        if (this.foundPatternCross(stateCount)) {
          var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);

          if (confirmed) {
            iSkip = stateCount[0];

            if (this.hasSkipped) {
              // Found a third one
              done = this.haveMultiplyConfirmedCenters();
            }
          }
        }
      }

      var patternInfo = this.selectBestPatterns();
      qrcode.orderBestPatterns(patternInfo);
      return new FinderPatternInfo(patternInfo);
    };
  }

  function AlignmentPattern(posX, posY, estimatedModuleSize) {
    this.x = posX;
    this.y = posY;
    this.count = 1;
    this.estimatedModuleSize = estimatedModuleSize;

    this.__defineGetter__("EstimatedModuleSize", function () {
      return this.estimatedModuleSize;
    });

    this.__defineGetter__("Count", function () {
      return this.count;
    });

    this.__defineGetter__("X", function () {
      return Math.floor(this.x);
    });

    this.__defineGetter__("Y", function () {
      return Math.floor(this.y);
    });

    this.incrementCount = function () {
      this.count++;
    };

    this.aboutEquals = function (moduleSize, i, j) {
      if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
        var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
        return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
      }

      return false;
    };
  }

  function AlignmentPatternFinder(image, startX, startY, width, height, moduleSize, resultPointCallback) {
    this.image = image;
    this.possibleCenters = new Array();
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.moduleSize = moduleSize;
    this.crossCheckStateCount = new Array(0, 0, 0);
    this.resultPointCallback = resultPointCallback;

    this.centerFromEnd = function (stateCount, end) {
      return end - stateCount[2] - stateCount[1] / 2.0;
    };

    this.foundPatternCross = function (stateCount) {
      var moduleSize = this.moduleSize;
      var maxVariance = moduleSize / 2.0;

      for (var i = 0; i < 3; i++) {
        if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
          return false;
        }
      }

      return true;
    };

    this.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
      var image = this.image;
      var maxI = qrcode.height;
      var stateCount = this.crossCheckStateCount;
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0; // Start counting up from center

      var i = startI;

      while (i >= 0 && image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
        stateCount[1]++;
        i--;
      } // If already too many modules in this state or ran off the edge:


      if (i < 0 || stateCount[1] > maxCount) {
        return NaN;
      }

      while (i >= 0 && !image[centerJ + i * qrcode.width] && stateCount[0] <= maxCount) {
        stateCount[0]++;
        i--;
      }

      if (stateCount[0] > maxCount) {
        return NaN;
      } // Now also count down from center


      i = startI + 1;

      while (i < maxI && image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
        stateCount[1]++;
        i++;
      }

      if (i == maxI || stateCount[1] > maxCount) {
        return NaN;
      }

      while (i < maxI && !image[centerJ + i * qrcode.width] && stateCount[2] <= maxCount) {
        stateCount[2]++;
        i++;
      }

      if (stateCount[2] > maxCount) {
        return NaN;
      }

      var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];

      if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
        return NaN;
      }

      return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
    };

    this.handlePossibleCenter = function (stateCount, i, j) {
      var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
      var centerJ = this.centerFromEnd(stateCount, j);
      var centerI = this.crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);

      if (!isNaN(centerI)) {
        var estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
        var max = this.possibleCenters.length;

        for (var index = 0; index < max; index++) {
          var center = this.possibleCenters[index]; // Look for about the same center and module size:

          if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
            return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
          }
        } // Hadn't found this before; save it


        var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
        this.possibleCenters.push(point);

        if (this.resultPointCallback != null) {
          this.resultPointCallback.foundPossibleResultPoint(point);
        }
      }

      return null;
    };

    this.find = function () {
      var startX = this.startX;
      var height = this.height;
      var maxJ = startX + width;
      var middleI = startY + (height >> 1); // We are looking for black/white/black modules in 1:1:1 ratio;
      // this tracks the number of black/white/black modules seen so far

      var stateCount = new Array(0, 0, 0);

      for (var iGen = 0; iGen < height; iGen++) {
        // Search from middle outwards
        var i = middleI + ((iGen & 0x01) == 0 ? iGen + 1 >> 1 : -(iGen + 1 >> 1));
        stateCount[0] = 0;
        stateCount[1] = 0;
        stateCount[2] = 0;
        var j = startX; // Burn off leading white pixels before anything else; if we start in the middle of
        // a white run, it doesn't make sense to count its length, since we don't know if the
        // white run continued to the left of the start point

        while (j < maxJ && !image[j + qrcode.width * i]) {
          j++;
        }

        var currentState = 0;

        while (j < maxJ) {
          if (image[j + i * qrcode.width]) {
            // Black pixel
            if (currentState == 1) {
              // Counting black pixels
              stateCount[currentState]++;
            } else {
              // Counting white pixels
              if (currentState == 2) {
                // A winner?
                if (this.foundPatternCross(stateCount)) {
                  // Yes
                  var confirmed = this.handlePossibleCenter(stateCount, i, j);

                  if (confirmed != null) {
                    return confirmed;
                  }
                }

                stateCount[0] = stateCount[2];
                stateCount[1] = 1;
                stateCount[2] = 0;
                currentState = 1;
              } else {
                stateCount[++currentState]++;
              }
            }
          } else {
            // White pixel
            if (currentState == 1) {
              // Counting black pixels
              currentState++;
            }

            stateCount[currentState]++;
          }

          j++;
        }

        if (this.foundPatternCross(stateCount)) {
          var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);

          if (confirmed != null) {
            return confirmed;
          }
        }
      } // Hmm, nothing we saw was observed and confirmed twice. If we had
      // any guess at all, return it.


      if (!(this.possibleCenters.length == 0)) {
        return this.possibleCenters[0];
      }

      throw "Couldn't find enough alignment patterns";
    };
  }

  function QRCodeDataBlockReader(blocks, version, numErrorCorrectionCode) {
    this.blockPointer = 0;
    this.bitPointer = 7;
    this.dataLength = 0;
    this.blocks = blocks;
    this.numErrorCorrectionCode = numErrorCorrectionCode;
    if (version <= 9) this.dataLengthMode = 0;else if (version >= 10 && version <= 26) this.dataLengthMode = 1;else if (version >= 27 && version <= 40) this.dataLengthMode = 2;

    this.getNextBits = function (numBits) {
      var bits = 0;

      if (numBits < this.bitPointer + 1) {
        // next word fits into current data block
        var mask = 0;

        for (var i = 0; i < numBits; i++) {
          mask += 1 << i;
        }

        mask <<= this.bitPointer - numBits + 1;
        bits = (this.blocks[this.blockPointer] & mask) >> this.bitPointer - numBits + 1;
        this.bitPointer -= numBits;
        return bits;
      } else if (numBits < this.bitPointer + 1 + 8) {
        // next word crosses 2 data blocks
        var mask1 = 0;

        for (var i = 0; i < this.bitPointer + 1; i++) {
          mask1 += 1 << i;
        }

        bits = (this.blocks[this.blockPointer] & mask1) << numBits - (this.bitPointer + 1);
        this.blockPointer++;
        bits += this.blocks[this.blockPointer] >> 8 - (numBits - (this.bitPointer + 1));
        this.bitPointer = this.bitPointer - numBits % 8;

        if (this.bitPointer < 0) {
          this.bitPointer = 8 + this.bitPointer;
        }

        return bits;
      } else if (numBits < this.bitPointer + 1 + 16) {
        // next word crosses 3 data blocks
        var mask1 = 0; // mask of first block

        var mask3 = 0; // mask of 3rd block
        //bitPointer + 1 : number of bits of the 1st block
        //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
        //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block 

        for (var i = 0; i < this.bitPointer + 1; i++) {
          mask1 += 1 << i;
        }

        var bitsFirstBlock = (this.blocks[this.blockPointer] & mask1) << numBits - (this.bitPointer + 1);
        this.blockPointer++;
        var bitsSecondBlock = this.blocks[this.blockPointer] << numBits - (this.bitPointer + 1 + 8);
        this.blockPointer++;

        for (var i = 0; i < numBits - (this.bitPointer + 1 + 8); i++) {
          mask3 += 1 << i;
        }

        mask3 <<= 8 - (numBits - (this.bitPointer + 1 + 8));
        var bitsThirdBlock = (this.blocks[this.blockPointer] & mask3) >> 8 - (numBits - (this.bitPointer + 1 + 8));
        bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
        this.bitPointer = this.bitPointer - (numBits - 8) % 8;

        if (this.bitPointer < 0) {
          this.bitPointer = 8 + this.bitPointer;
        }

        return bits;
      } else {
        return 0;
      }
    };

    this.NextMode = function () {
      if (this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2) return 0;else return this.getNextBits(4);
    };

    this.getDataLength = function (modeIndicator) {
      var index = 0;

      while (true) {
        if (modeIndicator >> index == 1) break;
        index++;
      }

      return this.getNextBits(qrcode.sizeOfDataLengthInfo[this.dataLengthMode][index]);
    };

    this.getRomanAndFigureString = function (dataLength) {
      var length = dataLength;
      var intData = 0;
      var strData = "";
      var tableRomanAndFigure = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':');

      do {
        if (length > 1) {
          intData = this.getNextBits(11);
          var firstLetter = Math.floor(intData / 45);
          var secondLetter = intData % 45;
          strData += tableRomanAndFigure[firstLetter];
          strData += tableRomanAndFigure[secondLetter];
          length -= 2;
        } else if (length == 1) {
          intData = this.getNextBits(6);
          strData += tableRomanAndFigure[intData];
          length -= 1;
        }
      } while (length > 0);

      return strData;
    };

    this.getFigureString = function (dataLength) {
      var length = dataLength;
      var intData = 0;
      var strData = "";

      do {
        if (length >= 3) {
          intData = this.getNextBits(10);
          if (intData < 100) strData += "0";
          if (intData < 10) strData += "0";
          length -= 3;
        } else if (length == 2) {
          intData = this.getNextBits(7);
          if (intData < 10) strData += "0";
          length -= 2;
        } else if (length == 1) {
          intData = this.getNextBits(4);
          length -= 1;
        }

        strData += intData;
      } while (length > 0);

      return strData;
    };

    this.get8bitByteArray = function (dataLength) {
      var length = dataLength;
      var intData = 0;
      var output = new Array();

      do {
        intData = this.getNextBits(8);
        output.push(intData);
        length--;
      } while (length > 0);

      return output;
    };

    this.getKanjiString = function (dataLength) {
      var length = dataLength;
      var intData = 0;
      var unicodeString = "";

      do {
        intData = this.getNextBits(13);
        var lowerByte = intData % 0xC0;
        var higherByte = intData / 0xC0;
        var tempWord = (higherByte << 8) + lowerByte;
        var shiftjisWord = 0;

        if (tempWord + 0x8140 <= 0x9FFC) {
          // between 8140 - 9FFC on Shift_JIS character set
          shiftjisWord = tempWord + 0x8140;
        } else {
          // between E040 - EBBF on Shift_JIS character set
          shiftjisWord = tempWord + 0xC140;
        } //var tempByte = new Array(0,0);
        //tempByte[0] = (sbyte) (shiftjisWord >> 8);
        //tempByte[1] = (sbyte) (shiftjisWord & 0xFF);
        //unicodeString += new String(SystemUtils.ToCharArray(SystemUtils.ToByteArray(tempByte)));


        unicodeString += String.fromCharCode(shiftjisWord);
        length--;
      } while (length > 0);

      return unicodeString;
    };

    this.parseECIValue = function () {
      var intData = 0;
      var firstByte = this.getNextBits(8);

      if ((firstByte & 0x80) == 0) {
        intData = firstByte & 0x7F;
      }

      if ((firstByte & 0xC0) == 0x80) {
        // two bytes
        var secondByte = this.getNextBits(8);
        intData = (firstByte & 0x3F) << 8 | secondByte;
      }

      if ((firstByte & 0xE0) == 0xC0) {
        // three bytes
        var secondThirdBytes = this.getNextBits(8);
        ;
        intData = (firstByte & 0x1F) << 16 | secondThirdBytes;
      }

      return intData;
    };

    this.__defineGetter__("DataByte", function () {
      var output = new Array();
      var MODE_NUMBER = 1;
      var MODE_ROMAN_AND_NUMBER = 2;
      var MODE_8BIT_BYTE = 4;
      var MODE_ECI = 7;
      var MODE_KANJI = 8;

      do {
        var mode = this.NextMode(); //canvas.println("mode: " + mode);

        if (mode == 0) {
          if (output.length > 0) break;else throw "Empty data block";
        }

        if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI && mode != MODE_ECI) {
          throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
        }

        if (mode == MODE_ECI) {
          var temp_sbyteArray3 = this.parseECIValue(); //output.push(temp_sbyteArray3);
        } else {
          var dataLength = this.getDataLength(mode);
          if (dataLength < 1) throw "Invalid data length: " + dataLength;

          switch (mode) {
            case MODE_NUMBER:
              var temp_str = this.getFigureString(dataLength);
              var ta = new Array(temp_str.length);

              for (var j = 0; j < temp_str.length; j++) {
                ta[j] = temp_str.charCodeAt(j);
              }

              output.push(ta);
              break;

            case MODE_ROMAN_AND_NUMBER:
              var temp_str = this.getRomanAndFigureString(dataLength);
              var ta = new Array(temp_str.length);

              for (var j = 0; j < temp_str.length; j++) {
                ta[j] = temp_str.charCodeAt(j);
              }

              output.push(ta);
              break;

            case MODE_8BIT_BYTE:
              var temp_sbyteArray3 = this.get8bitByteArray(dataLength);
              output.push(temp_sbyteArray3);
              break;

            case MODE_KANJI:
              var temp_str = this.getKanjiString(dataLength);
              output.push(temp_str);
              break;
          }
        }
      } while (true);

      return output;
    });
  }

  return qrcode;
}
/**
* @fileoverview
* HTML5 QR code scanning library.
* - Decode QR Code using web cam or smartphone camera
*
* @author mebjas <minhazav@gmail.com>
*
* The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
* http://www.denso-wave.com/qrcode/faqpatent-e.html
*
* Note: ECMA Script is not supported by all browsers. Use minified/html5-qrcode.min.js for better
* browser support. Alternatively the transpiled code lives in transpiled/html5-qrcode.js
*/


var Html5Qrcode = /*#__PURE__*/function () {
  //#region static constants
  //#endregion

  /**
   * Initialize QR Code scanner.
   *
   * @param {String} elementId - Id of the HTML element.
   * @param {Boolean} verbose - Optional argument, if true, all logs
   *                  would be printed to console.
   */
  function Html5Qrcode(elementId, verbose) {
    _classCallCheck(this, Html5Qrcode);

    if (!getLazarSoftScanner) {
      throw 'Use html5qrcode.min.js without edit, getLazarSoftScanner' + 'not found.';
    }

    this.qrcode = getLazarSoftScanner();

    if (!this.qrcode) {
      throw 'qrcode is not defined, use the minified/html5-qrcode.min.js' + ' for proper support';
    }

    this._elementId = elementId;
    this._foreverScanTimeout = null;
    this._localMediaStream = null;
    this._shouldScan = true;
    this._url = window.URL || window.webkitURL || window.mozURL || window.msURL;
    this._userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    this._isScanning = false;
    Html5Qrcode.VERBOSE = verbose === true;
  }
  /**
   * Start scanning QR Code for given camera.
   *
   * @param {String or Object} identifier of the camera, it can either be the
   *  cameraId retrieved from {@code Html5Qrcode#getCameras()} method or
   *  object with facingMode constraint.
   *  Example values:
   *      - "a76afe74e95e3aba9fc1b69c39b8701cde2d3e29aa73065c9cd89438627b3bde"
   *          ^ This is 'deviceId' from camera retrieved from
   *          {@code Html5Qrcode#getCameras()}
   *      - { facingMode: "user" }
   *      - { facingMode: "environment" }
   *      - { facingMode: { exact: "environment" } }
   *      - { facingMode: { exact: "user" } }
   *      - { deviceId: { exact: "a76afe74e95e3....73065c9cd89438627b3bde" }
   *      - { deviceId: "a76afe74e95e3....73065c9cd89438627b3bde" }
   *  Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Syntax
   * @param {Object} config extra configurations to tune QR code scanner.
   *  Supported Fields:
   *      - fps: expected framerate of qr code scanning. example { fps: 2 }
   *          means the scanning would be done every 500 ms.
   *      - qrbox: width of QR scanning box, this should be smaller than
   *          the width and height of the box. This would make the scanner
   *          look like this:
   *          ----------------------
   *          |********************|
   *          |******,,,,,,,,,*****|      <--- shaded region
   *          |******|       |*****|      <--- non shaded region would be
   *          |******|       |*****|          used for QR code scanning.
   *          |******|_______|*****|
   *          |********************|
   *          |********************|
   *          ----------------------
   *      - aspectRatio: Optional, desired aspect ratio for the video feed.
   *          Ideal aspect ratios are 4:3 or 16:9. Passing very wrong aspect
   *          ratio could lead to video feed not showing up.
   *      - disableFlip: Optional, if {@code true} flipped QR Code won't be
   *          scanned. Only use this if you are sure the camera cannot give
   *          mirrored feed if you are facing performance constraints.
   *      - videoConstraints: {MediaTrackConstraints}, Optional
   *          @beta(this config is not well supported yet).
   *
   *          Important: When passed this will override other parameters
   *          like 'cameraIdOrConfig' or configurations like 'aspectRatio'.
   *
   *          videoConstraints should be of type {@code MediaTrackConstraints}
   *          as defined in
   *          https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   *          and is used to specify a variety of video or camera controls
   *          like: aspectRatio, facingMode, frameRate, etc.
   * @param {Function} qrCodeSuccessCallback callback on QR Code found.
   *  Example:
   *      function(qrCodeMessage) {}
   * @param {Function} qrCodeErrorCallback callback on QR Code parse error.
   *  Example:
   *      function(errorMessage) {}
   *
   * @returns Promise for starting the scan. The Promise can fail if the user
   * doesn't grant permission or some API is not supported by the browser.
   */


  _createClass(Html5Qrcode, [{
    key: "start",
    value: function start(cameraIdOrConfig, configuration, qrCodeSuccessCallback, qrCodeErrorCallback) {
      var _this = this;

      if (!cameraIdOrConfig) {
        throw "cameraIdOrConfig is required";
      }

      if (!qrCodeSuccessCallback || typeof qrCodeSuccessCallback != "function") {
        throw "qrCodeSuccessCallback is required and should be a function.";
      }

      if (!qrCodeErrorCallback) {
        qrCodeErrorCallback = console.log;
      } // Cleanup.


      this._clearElement();

      var $this = this; // Create configuration by merging default and input settings.

      var config = configuration ? configuration : {};
      config.fps = config.fps ? config.fps : Html5Qrcode.SCAN_DEFAULT_FPS; // Check if videoConstraints is passed and valid

      var videoConstraintsAvailableAndValid = false;

      if (config.videoConstraints) {
        if (!this._isMediaStreamConstraintsValid(config.videoConstraints)) {
          Html5Qrcode._logError("'videoConstraints' is not valid 'MediaStreamConstraints, " + "it will be ignored.'",
          /* experimental= */
          true);
        } else {
          videoConstraintsAvailableAndValid = true;
        }
      }

      var videoConstraintsEnabled = videoConstraintsAvailableAndValid; // qr shaded box

      var isShadedBoxEnabled = config.qrbox != undefined;
      var element = document.getElementById(this._elementId);
      var width = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
      element.style.position = "relative";
      this._shouldScan = true;
      this._element = element;
      this.qrcode.callback = qrCodeSuccessCallback; // Validate before insertion

      if (isShadedBoxEnabled) {
        var qrboxSize = config.qrbox;

        if (qrboxSize < Html5Qrcode.MIN_QR_BOX_SIZE) {
          throw "minimum size of 'config.qrbox' is" + " ".concat(Html5Qrcode.MIN_QR_BOX_SIZE, "px.");
        }

        if (qrboxSize > width) {
          throw "'config.qrbox' should not be greater than the " + "width of the HTML element.";
        }
      } //#region local methods

      /**
       * Setups the UI elements, changes the state of this class.
       *
       * @param width derived width of viewfinder.
       * @param height derived height of viewfinder.
       */


      var setupUi = function setupUi(width, height) {
        var qrboxSize = config.qrbox;

        if (qrboxSize > height) {
          // TODO(mebjas): Migrate to common logging.
          console.warn("[Html5Qrcode] config.qrboxsize is greater " + "than video height. Shading will be ignored");
        }

        var shouldShadingBeApplied = isShadedBoxEnabled && qrboxSize <= height;
        var defaultQrRegion = {
          x: 0,
          y: 0,
          width: width,
          height: height
        };
        var qrRegion = shouldShadingBeApplied ? _this._getShadedRegionBounds(width, height, qrboxSize) : defaultQrRegion;

        var canvasElement = _this._createCanvasElement(qrRegion.width, qrRegion.height);

        var context = canvasElement.getContext('2d');
        context.canvas.width = qrRegion.width;
        context.canvas.height = qrRegion.height; // Insert the canvas

        element.append(canvasElement);

        if (shouldShadingBeApplied) {
          _this._possiblyInsertShadingElement(element, width, height, qrboxSize);
        } // Update local states


        $this._qrRegion = qrRegion;
        $this._context = context;
        $this._canvasElement = canvasElement;
      };
      /**
       * Scans current context using the qrcode library.
       *
       * <p>This method call would result in callback being triggered by the
       * qrcode library. This method also handles the border coloring.
       *
       * @returns true if scan match is found, false otherwise.
       */


      var scanContext = function scanContext() {
        try {
          $this.qrcode.decode();

          _this._possiblyUpdateShaders(
          /* qrMatch= */
          true);

          return true;
        } catch (exception) {
          _this._possiblyUpdateShaders(
          /* qrMatch= */
          false);

          qrCodeErrorCallback("QR code parse error, error = ".concat(exception));
          return false;
        }
      }; // Method that scans forever.


      var foreverScan = function foreverScan() {
        if (!$this._shouldScan) {
          // Stop scanning.
          return;
        }

        if ($this._localMediaStream) {
          // There is difference in size of rendered video and one that is
          // considered by the canvas. Need to account for scaling factor.
          var videoElement = $this._videoElement;
          var widthRatio = videoElement.videoWidth / videoElement.clientWidth;
          var heightRatio = videoElement.videoHeight / videoElement.clientHeight;
          var sWidthOffset = $this._qrRegion.width * widthRatio;
          var sHeightOffset = $this._qrRegion.height * heightRatio;
          var sxOffset = $this._qrRegion.x * widthRatio;
          var syOffset = $this._qrRegion.y * heightRatio; // Only decode the relevant area, ignore the shaded area,
          // More reference:
          // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

          $this._context.drawImage($this._videoElement,
          /* sx= */
          sxOffset,
          /* sy= */
          syOffset,
          /* sWidth= */
          sWidthOffset,
          /* sHeight= */
          sHeightOffset,
          /* dx= */
          0,
          /* dy= */
          0,
          /* dWidth= */
          $this._qrRegion.width,
          /* dHeight= */
          $this._qrRegion.height); // Try scanning normal frame and in case of failure, scan
          // the inverted context if not explictly disabled.
          // TODO(mebjas): Move this logic to qrcode.js


          if (!scanContext() && config.disableFlip !== true) {
            // scan inverted context.
            _this._context.translate(_this._context.canvas.width, 0);

            _this._context.scale(-1, 1);

            scanContext();
          }
        }

        $this._foreverScanTimeout = setTimeout(foreverScan, Html5Qrcode._getTimeoutFps(config.fps));
      }; // success callback when user media (Camera) is attached.


      var onMediaStreamReceived = function onMediaStreamReceived(mediaStream) {
        return new Promise(function (resolve, reject) {
          var setupVideo = function setupVideo() {
            var videoElement = _this._createVideoElement(width);

            $this._element.append(videoElement); // Attach listeners to video.


            videoElement.onabort = reject;
            videoElement.onerror = reject;

            videoElement.onplaying = function () {
              var videoWidth = videoElement.clientWidth;
              var videoHeight = videoElement.clientHeight;
              setupUi(videoWidth, videoHeight); // start scanning after video feed has started

              foreverScan();
              resolve();
            };

            videoElement.srcObject = mediaStream;
            videoElement.play(); // Set state

            $this._videoElement = videoElement;
          };

          $this._localMediaStream = mediaStream; // If videoConstraints is passed, ignore all other configs.

          if (videoConstraintsEnabled || !config.aspectRatio) {
            setupVideo();
          } else {
            var constraints = {
              aspectRatio: config.aspectRatio
            };
            var track = mediaStream.getVideoTracks()[0];
            track.applyConstraints(constraints).then(function (_) {
              return setupVideo();
            })["catch"](function (error) {
              // TODO(mebjas): Migrate to common logging.
              console.log("[Warning] [Html5Qrcode] Constriants could not " + "be satisfied, ignoring constraints", error);
              setupVideo();
            });
          }
        });
      }; //#endregion


      return new Promise(function (resolve, reject) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Ignore all other video constraints if the videoConstraints
          // is passed.
          var videoConstraints = videoConstraintsEnabled ? config.videoConstraints : $this._createVideoConstraints(cameraIdOrConfig);
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: videoConstraints
          }).then(function (stream) {
            onMediaStreamReceived(stream).then(function (_) {
              $this._isScanning = true;
              resolve();
            })["catch"](reject);
          })["catch"](function (err) {
            reject("Error getting userMedia, error = ".concat(err));
          });
        } else if (navigator.getUserMedia) {
          if (typeof cameraIdOrConfig != "string") {
            throw "The device doesn't support navigator.mediaDevices" + ", only supported cameraIdOrConfig in this case is" + " deviceId parameter (string).";
          }

          var getCameraConfig = {
            video: {
              optional: [{
                sourceId: cameraIdOrConfig
              }]
            }
          };
          navigator.getUserMedia(getCameraConfig, function (stream) {
            onMediaStreamReceived(stream).then(function (_) {
              $this._isScanning = true;
              resolve();
            })["catch"](reject);
          }, function (err) {
            reject("Error getting userMedia, error = ".concat(err));
          });
        } else {
          reject("Web camera streaming not supported by the browser.");
        }
      });
    }
    /**
     * Stops streaming QR Code video and scanning.
     *
     * @returns Promise for safely closing the video stream.
     */

  }, {
    key: "stop",
    value: function stop() {
      // TODO(mebjas): fail fast if the start() wasn't called.
      this._shouldScan = false;
      clearTimeout(this._foreverScanTimeout);
      var $this = this;
      return new Promise(function (resolve,
      /* ignore */
      reject) {
        $this.qrcode.callback = null;

        var tracksToClose = $this._localMediaStream.getVideoTracks().length;

        var tracksClosed = 0; // Removes the shaded region if exists.

        var removeQrRegion = function removeQrRegion() {
          while ($this._element.getElementsByClassName(Html5Qrcode.SHADED_REGION_CLASSNAME).length) {
            var shadedChild = $this._element.getElementsByClassName(Html5Qrcode.SHADED_REGION_CLASSNAME)[0];

            $this._element.removeChild(shadedChild);
          }
        };

        var onAllTracksClosed = function onAllTracksClosed() {
          $this._localMediaStream = null;

          $this._element.removeChild($this._videoElement);

          $this._element.removeChild($this._canvasElement);

          removeQrRegion();
          $this._isScanning = false;

          if ($this._qrRegion) {
            $this._qrRegion = null;
          }

          if ($this._context) {
            $this._context = null;
          }

          resolve(true);
        };

        $this._localMediaStream.getVideoTracks().forEach(function (videoTrack) {
          videoTrack.stop();
          ++tracksClosed;

          if (tracksClosed >= tracksToClose) {
            onAllTracksClosed();
          }
        });
      });
    }
    /**
     * Scans an Image File for QR Code.
     *
     * This feature is mutually exclusive to camera based scanning, you should
     * call stop() if the camera based scanning was ongoing.
     *
     * @param {File} imageFile a local file with Image content.
     * @param {boolean} showImage if true the Image will be rendered on given
     * element.
     *
     * @returns Promise with decoded QR code string on success and error message
      *             on failure. Failure could happen due to different reasons:
     *            1. QR Code decode failed because enough patterns not found in
      *                 image.
     *            2. Input file was not image or unable to load the image or
      *                 other image load errors.
     */

  }, {
    key: "scanFile",
    value: function scanFile(imageFile,
    /* default=true */
    showImage) {
      var $this = this;

      if (!imageFile || !(imageFile instanceof File)) {
        throw "imageFile argument is mandatory and should be instance " + "of File. Use 'event.target.files[0]'";
      }

      showImage = showImage === undefined ? true : showImage;

      if ($this._isScanning) {
        throw "Close ongoing scan before scanning a file.";
      }

      var computeCanvasDrawConfig = function computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight) {
        if (imageWidth <= containerWidth && imageHeight <= containerHeight) {
          // no downsampling needed.
          var xoffset = (containerWidth - imageWidth) / 2;
          var yoffset = (containerHeight - imageHeight) / 2;
          return {
            x: xoffset,
            y: yoffset,
            width: imageWidth,
            height: imageHeight
          };
        } else {
          var formerImageWidth = imageWidth;
          var formerImageHeight = imageHeight;

          if (imageWidth > containerWidth) {
            imageHeight = containerWidth / imageWidth * imageHeight;
            imageWidth = containerWidth;
          }

          if (imageHeight > containerHeight) {
            imageWidth = containerHeight / imageHeight * imageWidth;
            imageHeight = containerHeight;
          }

          Html5Qrcode._log("Image downsampled from " + "".concat(formerImageWidth, "X").concat(formerImageHeight) + " to ".concat(imageWidth, "X").concat(imageHeight, "."));

          return computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight);
        }
      };

      return new Promise(function (resolve, reject) {
        $this._possiblyCloseLastScanImageFile();

        $this._clearElement();

        $this._lastScanImageFile = imageFile;
        var inputImage = new Image();

        inputImage.onload = function () {
          var imageWidth = inputImage.width;
          var imageHeight = inputImage.height;
          var element = document.getElementById($this._elementId);
          var containerWidth = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH; // No default height anymore.

          var containerHeight = Math.max(element.clientHeight ? element.clientHeight : imageHeight, Html5Qrcode.FILE_SCAN_MIN_HEIGHT);
          var config = computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight);

          if (showImage) {
            var visibleCanvas = $this._createCanvasElement(containerWidth, containerHeight, 'qr-canvas-visible');

            visibleCanvas.style.display = "inline-block";
            element.appendChild(visibleCanvas);

            var _context = visibleCanvas.getContext('2d');

            _context.canvas.width = containerWidth;
            _context.canvas.height = containerHeight; // More reference
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

            _context.drawImage(inputImage,
            /* sx= */
            0,
            /* sy= */
            0,
            /* sWidth= */
            imageWidth,
            /* sHeight= */
            imageHeight,
            /* dx= */
            config.x,
            /* dy= */
            config.y,
            /* dWidth= */
            config.width,
            /* dHeight= */
            config.height);
          }

          var hiddenCanvas = $this._createCanvasElement(config.width, config.height);

          element.appendChild(hiddenCanvas);
          var context = hiddenCanvas.getContext('2d');
          context.canvas.width = config.width;
          context.canvas.height = config.height;
          context.drawImage(inputImage,
          /* sx= */
          0,
          /* sy= */
          0,
          /* sWidth= */
          imageWidth,
          /* sHeight= */
          imageHeight,
          /* dx= */
          0,
          /* dy= */
          0,
          /* dWidth= */
          config.width,
          /* dHeight= */
          config.height);

          try {
            resolve($this.qrcode.decode());
          } catch (exception) {
            reject("QR code parse error, error = ".concat(exception));
          }
        };

        inputImage.onerror = reject;
        inputImage.onabort = reject;
        inputImage.onstalled = reject;
        inputImage.onsuspend = reject;
        inputImage.src = URL.createObjectURL(imageFile);
      });
    }
    /**
     * Clears the existing canvas.
     *
     * Note: in case of ongoing web cam based scan, it needs to be explicitly
     * closed before calling this method, else it will throw exception.
     */

  }, {
    key: "clear",
    value: function clear() {
      this._clearElement();
    }
    /**
     * Returns a Promise with list of all cameras supported by the device.
     *
     * The returned object is a list of result object of type:
     * [{
     *      id: String;     // Id of the camera.
     *      label: String;  // Human readable name of the camera.
     * }]
     */

  }, {
    key: "getRunningTrackCapabilities",

    /**
     * Returns the capabilities of the running video track.
     *
     * @beta This is an experimental API
     * @returns the capabilities of a running video track.
     * @throws error if the scanning is not in running state.
     */
    value: function getRunningTrackCapabilities() {
      if (this._localMediaStream == null) {
        throw "Scanning is not in running state, call this API only when" + " QR code scanning using camera is in running state.";
      }

      if (this._localMediaStream.getVideoTracks().length == 0) {
        throw "No video tracks found";
      }

      var videoTrack = this._localMediaStream.getVideoTracks()[0];

      return videoTrack.getCapabilities();
    }
    /**
     * Apply a video constraints on running video track from camera.
     *
     * Important:
     *  1. Must be called only if the camera based scanning is in progress.
     *  2. Changing aspectRatio while scanner is running is not yet supported.
     *
     * @beta This is an experimental API
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */

  }, {
    key: "applyVideoConstraints",
    value: function applyVideoConstraints(videoConstaints) {
      var _this2 = this;

      if (!videoConstaints) {
        throw "videoConstaints is required argument.";
      } else if (!this._isMediaStreamConstraintsValid(videoConstaints)) {
        throw "invalid videoConstaints passed, check logs for more details";
      }

      if (this._localMediaStream == null) {
        throw "Scanning is not in running state, call this API only when" + " QR code scanning using camera is in running state.";
      }

      if (this._localMediaStream.getVideoTracks().length == 0) {
        throw "No video tracks found";
      }

      return new Promise(function (resolve, reject) {
        if ("aspectRatio" in videoConstaints) {
          reject("Chaning 'aspectRatio' in run-time is not yet " + "supported.");
          return;
        }

        var videoTrack = _this2._localMediaStream.getVideoTracks()[0]; // TODO(mebjas): This can be simplified to just return the promise
        // directly.


        videoTrack.applyConstraints(videoConstaints).then(function (_) {
          resolve(_);
        })["catch"](function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: "_clearElement",
    value: function _clearElement() {
      if (this._isScanning) {
        throw 'Cannot clear while scan is ongoing, close it first.';
      }

      var element = document.getElementById(this._elementId);
      element.innerHTML = "";
    }
  }, {
    key: "_createCanvasElement",
    value: function _createCanvasElement(width, height, customId) {
      var canvasWidth = width;
      var canvasHeight = height;
      var canvasElement = document.createElement('canvas');
      canvasElement.style.width = "".concat(canvasWidth, "px");
      canvasElement.style.height = "".concat(canvasHeight, "px");
      canvasElement.style.display = "none"; // This id is set by lazarsoft/jsqrcode

      canvasElement.id = customId == undefined ? 'qr-canvas' : customId;
      return canvasElement;
    }
  }, {
    key: "_createVideoElement",
    value: function _createVideoElement(width) {
      var videoElement = document.createElement('video');
      videoElement.style.width = "".concat(width, "px");
      videoElement.muted = true;
      videoElement.playsInline = true;
      return videoElement;
    }
  }, {
    key: "_getShadedRegionBounds",
    value: function _getShadedRegionBounds(width, height, qrboxSize) {
      if (qrboxSize > width || qrboxSize > height) {
        throw "'config.qrbox' should not be greater than the " + "width and height of the HTML element.";
      }

      return {
        x: (width - qrboxSize) / 2,
        y: (height - qrboxSize) / 2,
        width: qrboxSize,
        height: qrboxSize
      };
    }
  }, {
    key: "_possiblyInsertShadingElement",
    value: function _possiblyInsertShadingElement(element, width, height, qrboxSize) {
      if (width - qrboxSize < 1 || height - qrboxSize < 1) {
        return;
      }

      var shadingElement = document.createElement('div');
      shadingElement.style.position = "absolute";
      shadingElement.style.borderLeft = "".concat((width - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.borderRight = "".concat((width - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.borderTop = "".concat((height - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.borderBottom = "".concat((height - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.boxSizing = "border-box";
      shadingElement.style.top = "0px";
      shadingElement.style.bottom = "0px";
      shadingElement.style.left = "0px";
      shadingElement.style.right = "0px";
      shadingElement.id = "".concat(Html5Qrcode.SHADED_REGION_CLASSNAME); // Check if div is too small for shadows. As there are two 5px width borders the needs to have a size above 10px.

      if (width - qrboxSize < 11 || height - qrboxSize < 11) {
        this.hasBorderShaders = false;
      } else {
        var smallSize = 5;
        var largeSize = 40;

        this._insertShaderBorders(shadingElement, largeSize, smallSize, -smallSize, 0, true);

        this._insertShaderBorders(shadingElement, largeSize, smallSize, -smallSize, 0, false);

        this._insertShaderBorders(shadingElement, largeSize, smallSize, qrboxSize + smallSize, 0, true);

        this._insertShaderBorders(shadingElement, largeSize, smallSize, qrboxSize + smallSize, 0, false);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, -smallSize, -smallSize, true);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, qrboxSize + smallSize - largeSize, -smallSize, true);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, -smallSize, -smallSize, false);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, qrboxSize + smallSize - largeSize, -smallSize, false);

        this.hasBorderShaders = true;
      }

      element.append(shadingElement);
    }
  }, {
    key: "_insertShaderBorders",
    value: function _insertShaderBorders(shaderElem, width, height, top, side, isLeft) {
      var elem = document.createElement("div");
      elem.style.position = "absolute";
      elem.style.backgroundColor = Html5Qrcode.BORDER_SHADER_DEFAULT_COLOR;
      elem.style.width = "".concat(width, "px");
      elem.style.height = "".concat(height, "px");
      elem.style.top = "".concat(top, "px");

      if (isLeft) {
        elem.style.left = "".concat(side, "px");
      } else {
        elem.style.right = "".concat(side, "px");
      }

      if (!this.borderShaders) {
        this.borderShaders = [];
      }

      this.borderShaders.push(elem);
      shaderElem.appendChild(elem);
    }
  }, {
    key: "_possiblyUpdateShaders",
    value: function _possiblyUpdateShaders(qrMatch) {
      if (this.qrMatch === qrMatch) {
        return;
      }

      if (this.hasBorderShaders && this.borderShaders && this.borderShaders.length) {
        this.borderShaders.forEach(function (shader) {
          shader.style.backgroundColor = qrMatch ? Html5Qrcode.BORDER_SHADER_MATCH_COLOR : Html5Qrcode.BORDER_SHADER_DEFAULT_COLOR;
        });
      }

      this.qrMatch = qrMatch;
    }
  }, {
    key: "_possiblyCloseLastScanImageFile",
    value: function _possiblyCloseLastScanImageFile() {
      if (this._lastScanImageFile) {
        URL.revokeObjectURL(this._lastScanImageFile);
        this._lastScanImageFile = null;
      }
    } //#region private method to create correct camera selection filter.

  }, {
    key: "_createVideoConstraints",
    value: function _createVideoConstraints(cameraIdOrConfig) {
      if (typeof cameraIdOrConfig == "string") {
        // If it's a string it should be camera device Id.
        return {
          deviceId: {
            exact: cameraIdOrConfig
          }
        };
      } else if (_typeof(cameraIdOrConfig) == "object") {
        var facingModeKey = "facingMode";
        var deviceIdKey = "deviceId";
        var allowedFacingModeValues = {
          "user": true,
          "environment": true
        };
        var exactKey = "exact";

        var isValidFacingModeValue = function isValidFacingModeValue(value) {
          if (value in allowedFacingModeValues) {
            // Valid config
            return true;
          } else {
            // Invalid config
            throw "config has invalid 'facingMode' value = " + "'".concat(value, "'");
          }
        };

        var keys = Object.keys(cameraIdOrConfig);

        if (keys.length != 1) {
          throw "'cameraIdOrConfig' object should have exactly 1 key," + " if passed as an object, found ".concat(keys.length, " keys");
        }

        var key = Object.keys(cameraIdOrConfig)[0];

        if (key != facingModeKey && key != deviceIdKey) {
          throw "Only '".concat(facingModeKey, "' and '").concat(deviceIdKey, "' ") + " are supported for 'cameraIdOrConfig'";
        }

        if (key == facingModeKey) {
          /**
           * Supported scenarios:
           * - { facingMode: "user" }
           * - { facingMode: "environment" }
           * - { facingMode: { exact: "environment" } }
           * - { facingMode: { exact: "user" } }
           */
          var facingMode = cameraIdOrConfig[key];

          if (typeof facingMode == "string") {
            if (isValidFacingModeValue(facingMode)) {
              return {
                facingMode: facingMode
              };
            }
          } else if (_typeof(facingMode) == "object") {
            if (exactKey in facingMode) {
              if (isValidFacingModeValue(facingMode[exactKey])) {
                return {
                  facingMode: {
                    exact: facingMode[exactKey]
                  }
                };
              }
            } else {
              throw "'facingMode' should be string or object with" + " ".concat(exactKey, " as key.");
            }
          } else {
            var type = _typeof(facingMode);

            throw "Invalid type of 'facingMode' = ".concat(type);
          }
        } else {
          /**
           * key == deviceIdKey; Supported scenarios:
           * - { deviceId: { exact: "a76afe74e95e3.....38627b3bde" }
           * - { deviceId: "a76afe74e95e3....065c9cd89438627b3bde" }
           */
          var deviceId = cameraIdOrConfig[key];

          if (typeof deviceId == "string") {
            return {
              deviceId: deviceId
            };
          } else if (_typeof(deviceId) == "object") {
            if (exactKey in deviceId) {
              return {
                deviceId: {
                  exact: deviceId[exactKey]
                }
              };
            } else {
              throw "'deviceId' should be string or object with" + " ".concat(exactKey, " as key.");
            }
          } else {
            var _type = _typeof(deviceId);

            throw "Invalid type of 'deviceId' = ".concat(_type);
          }
        }
      } else {
        // invalid type
        var _type2 = _typeof(cameraIdOrConfig);

        throw "Invalid type of 'cameraIdOrConfig' = ".concat(_type2);
      }
    } //#endregion
    //#region private method to check for valid videoConstraints

  }, {
    key: "_isMediaStreamConstraintsValid",
    value: function _isMediaStreamConstraintsValid(videoConstraints) {
      if (!videoConstraints) {
        Html5Qrcode._logError("Empty videoConstraints",
        /* experimental= */
        true);

        return false;
      }

      if (_typeof(videoConstraints) !== "object") {
        var typeofVideoConstraints = _typeof(videoConstraints);

        Html5Qrcode._logError("videoConstraints should be of type object, the " + "object passed is of type ".concat(typeofVideoConstraints, "."),
        /* experimental= */
        true);

        return false;
      } // TODO(mebjas): Make this validity check more sophisticuated
      // Following keys are audio controls, audio controls are not supported.


      var bannedKeys = ["autoGainControl", "channelCount", "echoCancellation", "latency", "noiseSuppression", "sampleRate", "sampleSize", "volume"];
      var bannedkeysSet = new Set(bannedKeys);
      var keysInVideoConstraints = Object.keys(videoConstraints);

      for (var i = 0; i < keysInVideoConstraints.length; i++) {
        var key = keysInVideoConstraints[i];

        if (bannedkeysSet.has(key)) {
          Html5Qrcode._logError("".concat(key, " is not supported videoConstaints."),
          /* experimental= */
          true);

          return false;
        }
      }

      return true;
    } //#endregion

  }], [{
    key: "getCameras",
    value: function getCameras() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia) {
          _this3._log("navigator.mediaDevices used");

          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
          }).then(function (stream) {
            // hacky approach to close any active stream if they are
            // active.
            stream.oninactive = function (_) {
              return _this3._log("All streams closed");
            };

            var closeActiveStreams = function closeActiveStreams(stream) {
              var tracks = stream.getVideoTracks();

              for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];
                track.enabled = false;
                track.stop();
                stream.removeTrack(track);
              }
            };

            navigator.mediaDevices.enumerateDevices().then(function (devices) {
              var results = [];

              for (var i = 0; i < devices.length; i++) {
                var device = devices[i];

                if (device.kind == "videoinput") {
                  results.push({
                    id: device.deviceId,
                    label: device.label
                  });
                }
              }

              _this3._log("".concat(results.length, " results found"));

              closeActiveStreams(stream);
              resolve(results);
            })["catch"](function (err) {
              reject("".concat(err.name, " : ").concat(err.message));
            });
          })["catch"](function (err) {
            reject("".concat(err.name, " : ").concat(err.message));
          });
        } else if (MediaStreamTrack && MediaStreamTrack.getSources) {
          _this3._log("MediaStreamTrack.getSources used");

          var callback = function callback(sourceInfos) {
            var results = [];

            for (var i = 0; i !== sourceInfos.length; ++i) {
              var sourceInfo = sourceInfos[i];

              if (sourceInfo.kind === 'video') {
                results.push({
                  id: sourceInfo.id,
                  label: sourceInfo.label
                });
              }
            }

            _this3._log("".concat(results.length, " results found"));

            resolve(results);
          };

          MediaStreamTrack.getSources(callback);
        } else {
          _this3._log("unable to query supported devices.");

          reject("unable to query supported devices.");
        }
      });
    }
  }, {
    key: "_getTimeoutFps",
    value: function _getTimeoutFps(fps) {
      return 1000 / fps;
    }
  }, {
    key: "_log",
    value: function _log(message) {
      if (Html5Qrcode.VERBOSE) {
        console.log(message);
      }
    }
  }, {
    key: "_logError",
    value: function _logError(message, experimental) {
      if (Html5Qrcode.VERBOSE || experimental === true) {
        console.error(message);
      }
    }
  }]);

  return Html5Qrcode;
}();
/**
 * @fileoverview
 * Complete Scanner build on top of {@link Html5Qrcode}.
 * - Decode QR Code using web cam or smartphone camera
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 * 
 * Note: ECMA Script is not supported by all browsers. Use minified/html5-qrcode.min.js for better
 * browser support. Alternatively the transpiled code lives in transpiled/html5-qrcode.js
 */


_defineProperty(Html5Qrcode, "DEFAULT_WIDTH", 300);

_defineProperty(Html5Qrcode, "DEFAULT_WIDTH_OFFSET", 2);

_defineProperty(Html5Qrcode, "FILE_SCAN_MIN_HEIGHT", 300);

_defineProperty(Html5Qrcode, "SCAN_DEFAULT_FPS", 2);

_defineProperty(Html5Qrcode, "MIN_QR_BOX_SIZE", 50);

_defineProperty(Html5Qrcode, "SHADED_LEFT", 1);

_defineProperty(Html5Qrcode, "SHADED_RIGHT", 2);

_defineProperty(Html5Qrcode, "SHADED_TOP", 3);

_defineProperty(Html5Qrcode, "SHADED_BOTTOM", 4);

_defineProperty(Html5Qrcode, "SHADED_REGION_CLASSNAME", "qr-shaded-region");

_defineProperty(Html5Qrcode, "VERBOSE", false);

_defineProperty(Html5Qrcode, "BORDER_SHADER_DEFAULT_COLOR", "#ffffff");

_defineProperty(Html5Qrcode, "BORDER_SHADER_MATCH_COLOR", "rgb(90, 193, 56)");

var Html5QrcodeScanner = /*#__PURE__*/function () {
  /**
   * Creates instance of this class.
   *
   * @param {String} elementId - Id of the HTML element.
   * @param {Object} config extra configurations to tune QR code scanner.
   *  Supported Fields:
   *      - fps: expected framerate of qr code scanning. example { fps: 2 }
   *          means the scanning would be done every 500 ms.
   *      - qrbox: width of QR scanning box, this should be smaller than
   *          the width and height of the box. This would make the scanner
   *          look like this:
   *          ----------------------
   *          |********************|
   *          |******,,,,,,,,,*****|      <--- shaded region
   *          |******|       |*****|      <--- non shaded region would be
   *          |******|       |*****|          used for QR code scanning.
   *          |******|_______|*****|
   *          |********************|
   *          |********************|
   *          ----------------------
   *      - aspectRatio: Optional, desired aspect ratio for the video feed.
   *          Ideal aspect ratios are 4:3 or 16:9. Passing very wrong aspect
   *          ratio could lead to video feed not showing up.
   *      - disableFlip: Optional, if {@code true} flipped QR Code won't be
   *          scanned. Only use this if you are sure the camera cannot give
   *          mirrored feed if you are facing performance constraints.
   *      - videoConstraints: {MediaTrackConstraints}, Optional
   *          @beta(this config is not well supported yet).
   *
   *          Important: When passed this will override other parameters
   *          like 'cameraIdOrConfig' or configurations like 'aspectRatio'.
   *
   *          videoConstraints should be of type {@code MediaTrackConstraints}
   *          as defined in
   *          https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   *          and is used to specify a variety of video or camera controls
   *          like: aspectRatio, facingMode, frameRate, etc.
   * @param {Boolean} verbose - Optional argument, if true, all logs
   *                  would be printed to console. 
   */
  function Html5QrcodeScanner(elementId, config, verbose) {
    _classCallCheck(this, Html5QrcodeScanner);

    this.elementId = elementId;
    this.config = config;
    this.verbose = verbose === true;

    if (!document.getElementById(elementId)) {
      throw "HTML Element with id=".concat(elementId, " not found");
    }

    this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_CAMERA;
    this.sectionSwapAllowed = true;
    this.section = undefined;
    this.html5Qrcode = undefined;
    this.qrCodeSuccessCallback = undefined;
    this.qrCodeErrorCallback = undefined;
  }
  /**
   * Renders the User Interface
   * 
   * @param {Function} qrCodeSuccessCallback - callback on QR Code found.
   *  Example:
   *      function(qrCodeMessage) {}
   * @param {Function} qrCodeErrorCallback - callback on QR Code parse error.
   *  Example:
   *      function(errorMessage) {}
   * 
   */


  _createClass(Html5QrcodeScanner, [{
    key: "render",
    value: function render(qrCodeSuccessCallback, qrCodeErrorCallback) {
      var $this = this;
      this.lastMatchFound = undefined; // Add wrapper to success callback.

      this.qrCodeSuccessCallback = function (message) {
        $this.__setStatus("MATCH", Html5QrcodeScanner.STATUS_SUCCESS);

        if (qrCodeSuccessCallback) {
          qrCodeSuccessCallback(message);
        } else {
          if ($this.lastMatchFound == message) {
            return;
          }

          $this.lastMatchFound = message;

          $this.__setHeaderMessage("Last Match: ".concat(message), Html5QrcodeScanner.STATUS_SUCCESS);
        }
      }; // Add wrapper to failure callback


      this.qrCodeErrorCallback = function (error) {
        $this.__setStatus("Scanning");

        if (qrCodeErrorCallback) {
          qrCodeErrorCallback(error);
        }
      };

      var container = document.getElementById(this.elementId);
      container.innerHTML = "";

      this.__createBasicLayout(container);

      this.html5Qrcode = new Html5Qrcode(this.__getScanRegionId(), this.verbose);
    }
    /**
     * Removes the QR Code scanner.
     * 
     * @returns Promise which succeeds if the cleanup is complete successfully,
     *  fails otherwise.
     */

  }, {
    key: "clear",
    value: function clear() {
      var _this4 = this;

      var $this = this;

      var emptyHtmlContainer = function emptyHtmlContainer() {
        var mainContainer = document.getElementById(_this4.elementId);

        if (mainContainer) {
          mainContainer.innerHTML = "";

          _this4.__resetBasicLayout(mainContainer);
        }
      };

      if (this.html5Qrcode) {
        return new Promise(function (resolve, reject) {
          if ($this.html5Qrcode._isScanning) {
            $this.html5Qrcode.stop().then(function (_) {
              $this.html5Qrcode.clear();
              emptyHtmlContainer();
              resolve();
            })["catch"](function (error) {
              if ($this.verbose) {
                console.error("Unable to stop qrcode scanner", error);
              }

              reject(error);
            });
          }
        });
      }
    } //#region private control methods

  }, {
    key: "__createBasicLayout",
    value: function __createBasicLayout(parent) {
      parent.style.position = "relative";
      parent.style.padding = "0px";
      parent.style.border = "1px solid silver";

      this.__createHeader(parent);

      var qrCodeScanRegion = document.createElement("div");

      var scanRegionId = this.__getScanRegionId();

      qrCodeScanRegion.id = scanRegionId;
      qrCodeScanRegion.style.width = "100%";
      qrCodeScanRegion.style.minHeight = "100px";
      qrCodeScanRegion.style.textAlign = "center";
      parent.appendChild(qrCodeScanRegion);

      this.__insertCameraScanImageToScanRegion();

      var qrCodeDashboard = document.createElement("div");

      var dashboardId = this.__getDashboardId();

      qrCodeDashboard.id = dashboardId;
      qrCodeDashboard.style.width = "100%";
      parent.appendChild(qrCodeDashboard);

      this.__setupInitialDashboard(qrCodeDashboard);
    }
  }, {
    key: "__resetBasicLayout",
    value: function __resetBasicLayout(parent) {
      parent.style.border = "none";
    }
  }, {
    key: "__setupInitialDashboard",
    value: function __setupInitialDashboard(dashboard) {
      this.__createSection(dashboard);

      this.__createSectionControlPanel();

      this.__createSectionSwap();
    }
  }, {
    key: "__createHeader",
    value: function __createHeader(dashboard) {
      var header = document.createElement("div");
      header.style.textAlign = "left";
      header.style.margin = "0px";
      header.style.padding = "5px";
      header.style.fontSize = "20px";
      header.style.borderBottom = "1px solid rgba(192, 192, 192, 0.18)";
      dashboard.appendChild(header);
      var titleSpan = document.createElement("span");
      titleSpan.innerHTML = "QR Code Scanner";
      header.appendChild(titleSpan);
      var statusSpan = document.createElement("span");
      statusSpan.id = this.__getStatusSpanId();
      statusSpan.style["float"] = "right";
      statusSpan.style.padding = "5px 7px";
      statusSpan.style.fontSize = "14px";
      statusSpan.style.background = "#dedede6b";
      statusSpan.style.border = "1px solid #00000000";
      statusSpan.style.color = "rgb(17, 17, 17)";
      header.appendChild(statusSpan);

      this.__setStatus("IDLE");

      var headerMessageContainer = document.createElement("div");
      headerMessageContainer.id = this.__getHeaderMessageContainerId();
      headerMessageContainer.style.display = "none";
      headerMessageContainer.style.fontSize = "14px";
      headerMessageContainer.style.padding = "2px 10px";
      headerMessageContainer.style.marginTop = "4px";
      headerMessageContainer.style.borderTop = "1px solid #f6f6f6";
      header.appendChild(headerMessageContainer);
    }
  }, {
    key: "__createSection",
    value: function __createSection(dashboard) {
      var section = document.createElement("div");
      section.id = this.__getDashboardSectionId();
      section.style.width = "100%";
      section.style.padding = "10px";
      section.style.textAlign = "left";
      dashboard.appendChild(section);
    }
  }, {
    key: "__createSectionControlPanel",
    value: function __createSectionControlPanel() {
      var $this = this;
      var section = document.getElementById(this.__getDashboardSectionId());
      var sectionControlPanel = document.createElement("div");
      section.appendChild(sectionControlPanel);
      var scpCameraScanRegion = document.createElement("div");
      scpCameraScanRegion.id = this.__getDashboardSectionCameraScanRegionId();
      scpCameraScanRegion.style.display = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA ? "block" : "none";
      sectionControlPanel.appendChild(scpCameraScanRegion); // Assuming when the object is created permission is needed.

      var requestPermissionContainer = document.createElement("div");
      requestPermissionContainer.style.textAlign = "center";
      var requestPermissionButton = document.createElement("button");
      requestPermissionButton.innerHTML = "Request Camera Permissions";
      requestPermissionButton.addEventListener("click", function () {
        requestPermissionButton.disabled = true;

        $this.__setStatus("PERMISSION");

        $this.__setHeaderMessage("Requesting camera permissions...");

        Html5Qrcode.getCameras().then(function (cameras) {
          $this.__setStatus("IDLE");

          $this.__resetHeaderMessage();

          if (!cameras || cameras.length == 0) {
            $this.__setStatus("No Cameras", Html5QrcodeScanner.STATUS_WARNING);
          } else {
            scpCameraScanRegion.removeChild(requestPermissionContainer);

            $this.__renderCameraSelection(cameras);
          }
        })["catch"](function (error) {
          requestPermissionButton.disabled = false;

          $this.__setStatus("IDLE");

          $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
        });
      });
      requestPermissionContainer.appendChild(requestPermissionButton);
      scpCameraScanRegion.appendChild(requestPermissionContainer);
      var fileBasedScanRegion = document.createElement("div");
      fileBasedScanRegion.id = this.__getDashboardSectionFileScanRegionId();
      fileBasedScanRegion.style.textAlign = "center";
      fileBasedScanRegion.style.display = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA ? "none" : "block";
      sectionControlPanel.appendChild(fileBasedScanRegion);
      var fileScanInput = document.createElement("input");
      fileScanInput.id = this.__getFileScanInputId();
      fileScanInput.accept = "image/*";
      fileScanInput.type = "file";
      fileScanInput.style.width = "200px";
      fileScanInput.disabled = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA;
      var fileScanLabel = document.createElement("span");
      fileScanLabel.innerHTML = "&nbsp; Select Image";
      fileBasedScanRegion.appendChild(fileScanInput);
      fileBasedScanRegion.appendChild(fileScanLabel);
      fileScanInput.addEventListener('change', function (e) {
        if ($this.currentScanType !== Html5QrcodeScanner.SCAN_TYPE_FILE) {
          return;
        }

        if (e.target.files.length == 0) {
          return;
        }

        var file = e.target.files[0];
        $this.html5Qrcode.scanFile(file, true).then(function (qrCode) {
          $this.__resetHeaderMessage();

          $this.qrCodeSuccessCallback(qrCode);
        })["catch"](function (error) {
          $this.__setStatus("ERROR", Html5QrcodeScanner.STATUS_WARNING);

          $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);

          $this.qrCodeErrorCallback(error);
        });
      });
    }
  }, {
    key: "__renderCameraSelection",
    value: function __renderCameraSelection(cameras) {
      var $this = this;
      var scpCameraScanRegion = document.getElementById(this.__getDashboardSectionCameraScanRegionId());
      scpCameraScanRegion.style.textAlign = "center";
      var cameraSelectionContainer = document.createElement("span");
      cameraSelectionContainer.innerHTML = "Select Camera (".concat(cameras.length, ") &nbsp;");
      cameraSelectionContainer.style.marginRight = "10px";
      var cameraSelectionSelect = document.createElement("select");
      cameraSelectionSelect.id = this.__getCameraSelectionId();

      for (var i = 0; i < cameras.length; i++) {
        var camera = cameras[i];
        var value = camera.id;
        var name = camera.label == null ? value : camera.label;
        var option = document.createElement('option');
        option.value = value;
        option.innerHTML = name;
        cameraSelectionSelect.appendChild(option);
      }

      cameraSelectionContainer.appendChild(cameraSelectionSelect);
      scpCameraScanRegion.appendChild(cameraSelectionContainer);
      var cameraActionContainer = document.createElement("span");
      var cameraActionStartButton = document.createElement("button");
      cameraActionStartButton.innerHTML = "Start Scanning";
      cameraActionContainer.appendChild(cameraActionStartButton);
      var cameraActionStopButton = document.createElement("button");
      cameraActionStopButton.innerHTML = "Stop Scanning";
      cameraActionStopButton.style.display = "none";
      cameraActionStopButton.disabled = true;
      cameraActionContainer.appendChild(cameraActionStopButton);
      scpCameraScanRegion.appendChild(cameraActionContainer);
      cameraActionStartButton.addEventListener('click', function (_) {
        cameraSelectionSelect.disabled = true;
        cameraActionStartButton.disabled = true;

        $this._showHideScanTypeSwapLink(false);

        var config = $this.config ? $this.config : {
          fps: 10,
          qrbox: 250
        };
        var cameraId = cameraSelectionSelect.value;
        $this.html5Qrcode.start(cameraId, config, $this.qrCodeSuccessCallback, $this.qrCodeErrorCallback).then(function (_) {
          cameraActionStopButton.disabled = false;
          cameraActionStopButton.style.display = "inline-block";
          cameraActionStartButton.style.display = "none";

          $this.__setStatus("Scanning");
        })["catch"](function (error) {
          $this._showHideScanTypeSwapLink(true);

          cameraSelectionSelect.disabled = false;
          cameraActionStartButton.disabled = false;

          $this.__setStatus("IDLE");

          $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
        });
      });
      cameraActionStopButton.addEventListener('click', function (_) {
        cameraActionStopButton.disabled = true;
        $this.html5Qrcode.stop().then(function (_) {
          $this._showHideScanTypeSwapLink(true);

          cameraSelectionSelect.disabled = false;
          cameraActionStartButton.disabled = false;
          cameraActionStopButton.style.display = "none";
          cameraActionStartButton.style.display = "inline-block";

          $this.__setStatus("IDLE");

          $this.__insertCameraScanImageToScanRegion();
        })["catch"](function (error) {
          cameraActionStopButton.disabled = false;

          $this.__setStatus("ERROR", Html5QrcodeScanner.STATUS_WARNING);

          $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
        });
      });
    }
  }, {
    key: "__createSectionSwap",
    value: function __createSectionSwap() {
      var $this = this;
      var TEXT_IF_CAMERA_SCAN_SELECTED = "Scan an Image File";
      var TEXT_IF_FILE_SCAN_SELECTED = "Scan using camera directly";
      var section = document.getElementById(this.__getDashboardSectionId());
      var switchContainer = document.createElement("div");
      switchContainer.style.textAlign = "center";
      var swithToFileBasedLink = document.createElement("a");
      swithToFileBasedLink.style.textDecoration = "underline";
      swithToFileBasedLink.id = this.__getDashboardSectionSwapLinkId();
      swithToFileBasedLink.innerHTML = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA ? TEXT_IF_CAMERA_SCAN_SELECTED : TEXT_IF_FILE_SCAN_SELECTED;
      swithToFileBasedLink.href = "#scan-using-file";
      swithToFileBasedLink.addEventListener('click', function () {
        if (!$this.sectionSwapAllowed) {
          if ($this.verbose) {
            console.error("Section swap called when not allowed");
          }

          return;
        } // Cleanup states


        $this.__setStatus("IDLE");

        $this.__resetHeaderMessage();

        $this.__getFileScanInput().value = "";
        $this.sectionSwapAllowed = false;

        if ($this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA) {
          // swap to file
          $this.__clearScanRegion();

          $this.__getFileScanInput().disabled = false;
          $this.__getCameraScanRegion().style.display = "none";
          $this.__getFileScanRegion().style.display = "block";
          swithToFileBasedLink.innerHTML = TEXT_IF_FILE_SCAN_SELECTED;
          $this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_FILE;

          $this.__insertFileScanImageToScanRegion();
        } else {
          // swap to camera based scanning
          $this.__clearScanRegion();

          $this.__getFileScanInput().disabled = true;
          $this.__getCameraScanRegion().style.display = "block";
          $this.__getFileScanRegion().style.display = "none";
          swithToFileBasedLink.innerHTML = TEXT_IF_CAMERA_SCAN_SELECTED;
          $this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_CAMERA;

          $this.__insertCameraScanImageToScanRegion();
        }

        $this.sectionSwapAllowed = true;
      });
      switchContainer.appendChild(swithToFileBasedLink);
      section.appendChild(switchContainer);
    }
  }, {
    key: "__setStatus",
    value: function __setStatus(statusText, statusClass) {
      if (!statusClass) {
        statusClass = Html5QrcodeScanner.STATUS_DEFAULT;
      }

      var statusSpan = document.getElementById(this.__getStatusSpanId());
      statusSpan.innerHTML = statusText;

      switch (statusClass) {
        case Html5QrcodeScanner.STATUS_SUCCESS:
          statusSpan.style.background = "#6aaf5042";
          statusSpan.style.color = "#477735";
          break;

        case Html5QrcodeScanner.STATUS_WARNING:
          statusSpan.style.background = "#cb243124";
          statusSpan.style.color = "#cb2431";
          break;

        case Html5QrcodeScanner.STATUS_DEFAULT:
        default:
          statusSpan.style.background = "#eef";
          statusSpan.style.color = "rgb(17, 17, 17)";
          break;
      }
    }
  }, {
    key: "__resetHeaderMessage",
    value: function __resetHeaderMessage() {
      var messageDiv = document.getElementById(this.__getHeaderMessageContainerId());
      messageDiv.style.display = "none";
    }
  }, {
    key: "__setHeaderMessage",
    value: function __setHeaderMessage(messageText, statusClass) {
      if (!statusClass) {
        statusClass = Html5QrcodeScanner.STATUS_DEFAULT;
      }

      var messageDiv = document.getElementById(this.__getHeaderMessageContainerId());
      messageDiv.innerHTML = messageText;
      messageDiv.style.display = "block";

      switch (statusClass) {
        case Html5QrcodeScanner.STATUS_SUCCESS:
          messageDiv.style.background = "#6aaf5042";
          messageDiv.style.color = "#477735";
          break;

        case Html5QrcodeScanner.STATUS_WARNING:
          messageDiv.style.background = "#cb243124";
          messageDiv.style.color = "#cb2431";
          break;

        case Html5QrcodeScanner.STATUS_DEFAULT:
        default:
          messageDiv.style.background = "#00000000";
          messageDiv.style.color = "rgb(17, 17, 17)";
          break;
      }
    }
  }, {
    key: "_showHideScanTypeSwapLink",
    value: function _showHideScanTypeSwapLink(shouldDisplay) {
      if (shouldDisplay !== true) {
        shouldDisplay = false;
      }

      this.sectionSwapAllowed = shouldDisplay;
      this.__getDashboardSectionSwapLink().style.display = shouldDisplay ? "inline-block" : "none";
    }
  }, {
    key: "__insertCameraScanImageToScanRegion",
    value: function __insertCameraScanImageToScanRegion() {
      var $this = this;
      var qrCodeScanRegion = document.getElementById(this.__getScanRegionId());

      if (this.cameraScanImage) {
        qrCodeScanRegion.innerHTML = "<br>";
        qrCodeScanRegion.appendChild(this.cameraScanImage);
        return;
      }

      this.cameraScanImage = new Image();

      this.cameraScanImage.onload = function (_) {
        qrCodeScanRegion.innerHTML = "<br>";
        qrCodeScanRegion.appendChild($this.cameraScanImage);
      };

      this.cameraScanImage.width = 64;
      this.cameraScanImage.style.opacity = 0.3;
      this.cameraScanImage.src = Html5QrcodeScanner.ASSET_CAMERA_SCAN;
    }
  }, {
    key: "__insertFileScanImageToScanRegion",
    value: function __insertFileScanImageToScanRegion() {
      var $this = this;
      var qrCodeScanRegion = document.getElementById(this.__getScanRegionId());

      if (this.fileScanImage) {
        qrCodeScanRegion.innerHTML = "<br>";
        qrCodeScanRegion.appendChild(this.fileScanImage);
        return;
      }

      this.fileScanImage = new Image();

      this.fileScanImage.onload = function (_) {
        qrCodeScanRegion.innerHTML = "<br>";
        qrCodeScanRegion.appendChild($this.fileScanImage);
      };

      this.fileScanImage.width = 64;
      this.fileScanImage.style.opacity = 0.3;
      this.fileScanImage.src = Html5QrcodeScanner.ASSET_FILE_SCAN;
    }
  }, {
    key: "__clearScanRegion",
    value: function __clearScanRegion() {
      var qrCodeScanRegion = document.getElementById(this.__getScanRegionId());
      qrCodeScanRegion.innerHTML = "";
    } //#endregion
    //#region state getters

  }, {
    key: "__getDashboardSectionId",
    value: function __getDashboardSectionId() {
      return "".concat(this.elementId, "__dashboard_section");
    }
  }, {
    key: "__getDashboardSectionCameraScanRegionId",
    value: function __getDashboardSectionCameraScanRegionId() {
      return "".concat(this.elementId, "__dashboard_section_csr");
    }
  }, {
    key: "__getDashboardSectionFileScanRegionId",
    value: function __getDashboardSectionFileScanRegionId() {
      return "".concat(this.elementId, "__dashboard_section_fsr");
    }
  }, {
    key: "__getDashboardSectionSwapLinkId",
    value: function __getDashboardSectionSwapLinkId() {
      return "".concat(this.elementId, "__dashboard_section_swaplink");
    }
  }, {
    key: "__getScanRegionId",
    value: function __getScanRegionId() {
      return "".concat(this.elementId, "__scan_region");
    }
  }, {
    key: "__getDashboardId",
    value: function __getDashboardId() {
      return "".concat(this.elementId, "__dashboard");
    }
  }, {
    key: "__getFileScanInputId",
    value: function __getFileScanInputId() {
      return "".concat(this.elementId, "__filescan_input");
    }
  }, {
    key: "__getStatusSpanId",
    value: function __getStatusSpanId() {
      return "".concat(this.elementId, "__status_span");
    }
  }, {
    key: "__getHeaderMessageContainerId",
    value: function __getHeaderMessageContainerId() {
      return "".concat(this.elementId, "__header_message");
    }
  }, {
    key: "__getCameraSelectionId",
    value: function __getCameraSelectionId() {
      return "".concat(this.elementId, "__camera_selection");
    }
  }, {
    key: "__getCameraScanRegion",
    value: function __getCameraScanRegion() {
      return document.getElementById(this.__getDashboardSectionCameraScanRegionId());
    }
  }, {
    key: "__getFileScanRegion",
    value: function __getFileScanRegion() {
      return document.getElementById(this.__getDashboardSectionFileScanRegionId());
    }
  }, {
    key: "__getFileScanInput",
    value: function __getFileScanInput() {
      return document.getElementById(this.__getFileScanInputId());
    }
  }, {
    key: "__getDashboardSectionSwapLink",
    value: function __getDashboardSectionSwapLink() {
      return document.getElementById(this.__getDashboardSectionSwapLinkId());
    } //#endregion

  }]);

  return Html5QrcodeScanner;
}();

_defineProperty(Html5QrcodeScanner, "SCAN_TYPE_CAMERA", "SCAN_TYPE_CAMERA");

_defineProperty(Html5QrcodeScanner, "SCAN_TYPE_FILE", "SCAN_TYPE_FILE");

_defineProperty(Html5QrcodeScanner, "STATUS_SUCCESS", "STATUS_SUCCESS");

_defineProperty(Html5QrcodeScanner, "STATUS_WARNING", "STATUS_WARNING");

_defineProperty(Html5QrcodeScanner, "STATUS_DEFAULT", "STATUS_DEFAULT");

_defineProperty(Html5QrcodeScanner, "ASSET_FILE_SCAN", "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets/file-scan.gif");

_defineProperty(Html5QrcodeScanner, "ASSET_CAMERA_SCAN", "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets/camera-scan.gif");
