
# About

Twokeys is a small JavaScript library (<1kb minified and gzipped) that offers core data exploration techniques such as summary, binning and smoothing. The library is named after  John Tukey, a founding mind in [data exploration and analysis](http://en.wikipedia.org/wiki/Exploratory_data_analysis) and a personal hero of the author.

# Examples

    var twokeys = new Twokeys(),
    	series = new twokeys.Series({data: twokeys._randomSeries(10 /*count*/, 100 /*max number*/)}),
    	analysis = series.describe();

The library has a well-developed `Series` protoype for data exploration and a rudimentary `Points` prototype for generating random two-dimensional series. Applying the convenience method `describe()` to a new `Series` returns an object on which all routines have attached their results.

Resulting `analysis` object:

	{
	    "original": [48, 59, 63, 30, 57, 92, 73, 47, 31, 5],
	    "summary": {
	        "median": {
	            "datum": 52.5,
	            "depth": 5.5
	        },
	        "mean": 50.5,
	        "mode": [],
	        "hinges": [{
	            "datum": 31,
	            "depth": 3
	        }, {
	            "datum": 63,
	            "depth": 8
	        }],
	        "adjacent": [30, 92],
	        "outliers": [],
	        "outer": [-43.5, 148.5],
	        "outside": [],
	        "inside": [5, 30, 31, 47, 48, 57, 59, 63, 73, 92],
	        "extremes": [5, 92],
	        "iqr": 32,
	        "fences": [4.5, 100.5]
	    },
	    "smooths": {
	        "smooth": [48, 30, 57, 57, 57, 47, 31, 5, 5, 5],
	        "hanning": [48, 61, 46.5, 43.5, 74.5, 82.5, 60, 39, 18, 5]
	    },
	    "transforms": {
	        "logs": [3.871201010907891, 4.07753744390572, 4.143134726391533, 3.4011973816621555, 4.04305126783455, 4.5217885770490405, 4.290459441148391, 3.8501476017100584, 3.4339872044851463, 1.6094379124341003],
	        "roots": [6.928203230275509, 7.681145747868608, 7.937253933193772, 5.477225575051661, 7.54983443527075, 9.591663046625438, 8.54400374531753, 6.855654600401044, 5.5677643628300215, 2.23606797749979],
	        "inverse": [0.020833333333333332, 0.01694915254237288, 0.015873015873015872, 0.03333333333333333, 0.017543859649122806, 0.010869565217391304, 0.0136986301369863, 0.02127659574468085, 0.03225806451612903, 0.2]
	    },
	    "counts": [
	        [5, 1],
	        [30, 1],
	        [31, 1],
	        [47, 1],
	        [48, 1],
	        [57, 1],
	        [59, 1],
	        [63, 1],
	        [73, 1],
	        [92, 1]
	    ],
	    "sorted": [5, 30, 31, 47, 48, 57, 59, 63, 73, 92],
	    "ranked": {
	        "up": {
	            "5": {
	                "rank": 10,
	                "peers": 0
	            },
	            "30": {
	                "rank": 8,
	                "peers": 0
	            },
	            "31": {
	                "rank": 6,
	                "peers": 0
	            },
	            "47": {
	                "rank": 4,
	                "peers": 0
	            },
	            "48": {
	                "rank": 2,
	                "peers": 0
	            },
	            "57": {
	                "rank": 0,
	                "peers": 0
	            },
	            "59": {
	                "rank": -2,
	                "peers": 0
	            },
	            "63": {
	                "rank": -4,
	                "peers": 0
	            },
	            "73": {
	                "rank": -6,
	                "peers": 0
	            },
	            "92": {
	                "rank": -8,
	                "peers": 0
	            }
	        },
	        "down": {
	            "5": {
	                "rank": 1,
	                "peers": 0
	            },
	            "30": {
	                "rank": 3,
	                "peers": 0
	            },
	            "31": {
	                "rank": 5,
	                "peers": 0
	            },
	            "47": {
	                "rank": 7,
	                "peers": 0
	            },
	            "48": {
	                "rank": 9,
	                "peers": 0
	            },
	            "57": {
	                "rank": 11,
	                "peers": 0
	            },
	            "59": {
	                "rank": 13,
	                "peers": 0
	            },
	            "63": {
	                "rank": 15,
	                "peers": 0
	            },
	            "73": {
	                "rank": 17,
	                "peers": 0
	            },
	            "92": {
	                "rank": 19,
	                "peers": 0
	            }
	        },
	        "groups": {
	            "down": [5, 30, 31, 47, 48, 57, 59, 63, 73, 92],
	            "up": [92, 73, 63, 59, 57, 48, 47, 31, 30, 5]
	        }
	    },
	    "binned": {
	        "bins": 4,
	        "width": 26,
	        "binned": {
	            "0": {
	                "from": 0,
	                "to": 25,
	                "data": [5]
	            },
	            "1": {
	                "from": 26,
	                "to": 51,
	                "data": [30, 31, 47, 48]
	            },
	            "2": {
	                "from": 52,
	                "to": 77,
	                "data": [57, 59, 63, 73]
	            },
	            "3": {
	                "from": 78,
	                "to": 103,
	                "data": [92]
	            }
	        }
	    }
	}


You can also run operations singularly:

	analysis.sorted()
	
	> [5,30,31,47,48,57,59,63,73,92]
	
	analysis.median()
	> {"datum":52.5,"depth":5.5}
	
	analysis.mode()
	> []
	
	analysis.fencees()
	> [4.5,100.5]
	
	analysis.iqr()
	
	> 32
	
	analysis.hinges()
	
	> [{"datum":31,"depth":3},{"datum":63,"depth":8}]
	
	analysis.outer()
	> [-43.5,148.5]
	
	analysis.outside()
	> []
	
	analysis.inside()
	> [5,30,31,47,48,57,59,63,73,92]
	
	analysis.outliers() 
	> []
	
	analysis.adjacent() 
	> [30,92]
	
	analysis.ranked()
	
	> {"up":{"5":{"rank":10,"peers":0},"30":{"rank":8,"peers":0},"31":{"rank":6,"peers":0},"47":{"rank":4,"peers":0},"48":{"rank":2,"peers":0},"57":{"rank":0,"peers":0},"59":{"rank":-2,"peers":0},"63":{"rank":-4,"peers":0},"73":{"rank":-6,"peers":0},"92":{"rank":-8,"peers":0}},"down":{"5":{"rank":1,"peers":0},"30":{"rank":3,"peers":0},"31":{"rank":5,"peers":0},"47":{"rank":7,"peers":0},"48":{"rank":9,"peers":0},"57":{"rank":11,"peers":0},"59":{"rank":13,"peers":0},"63":{"rank":15,"peers":0},"73":{"rank":17,"peers":0},"92":{"rank":19,"peers":0}},"groups":{"down":[5,30,31,47,48,57,59,63,73,92],"up":[92,73,63,59,57,48,47,31,30,5]}}
	
	analysis.logs()
	
	> [3.871201010907891,4.07753744390572,4.143134726391533,3.4011973816621555,4.04305126783455,4.5217885770490405,4.290459441148391,3.8501476017100584,3.4339872044851463,1.6094379124341003]
	
	analysis.roots() 
	
	> [6.928203230275509,7.681145747868608,7.937253933193772,5.477225575051661,7.54983443527075,9.591663046625438,8.54400374531753,6.855654600401044,5.5677643628300215,2.23606797749979]
	
	analysis.hanning()
	
	> [48,61,46.5,43.5,74.5,82.5,60,39,18,5]
	
	analysis.smooth()
	
	> [48,30,57,57,57,47,31,5,5,5]
	
	analysis.binned()

