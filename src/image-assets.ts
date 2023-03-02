/**
 * @fileoverview - Exports base64 assets for gif images.
 *
 * @author mebjas <minhazav@gmail.com>
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

const SVG_XML_PREFIX = "data:image/svg+xml;base64,";

export const ASSET_CAMERA_SCAN: string = SVG_XML_PREFIX + "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNzEuNjQzIDM3MS42NDMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM3MS42NDMgMzcxLjY0MyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTEwNS4wODQgMzguMjcxaDE2My43Njh2MjBIMTA1LjA4NHoiLz48cGF0aCBkPSJNMzExLjU5NiAxOTAuMTg5Yy03LjQ0MS05LjM0Ny0xOC40MDMtMTYuMjA2LTMyLjc0My0yMC41MjJWMzBjMC0xNi41NDItMTMuNDU4LTMwLTMwLTMwSDEyNS4wODRjLTE2LjU0MiAwLTMwIDEzLjQ1OC0zMCAzMHYxMjAuMTQzaC04LjI5NmMtMTYuNTQyIDAtMzAgMTMuNDU4LTMwIDMwdjEuMzMzYTI5LjgwNCAyOS44MDQgMCAwIDAgNC42MDMgMTUuOTM5Yy03LjM0IDUuNDc0LTEyLjEwMyAxNC4yMjEtMTIuMTAzIDI0LjA2MXYxLjMzM2MwIDkuODQgNC43NjMgMTguNTg3IDEyLjEwMyAyNC4wNjJhMjkuODEgMjkuODEgMCAwIDAtNC42MDMgMTUuOTM4djEuMzMzYzAgMTYuNTQyIDEzLjQ1OCAzMCAzMCAzMGg4LjMyNGMuNDI3IDExLjYzMSA3LjUwMyAyMS41ODcgMTcuNTM0IDI2LjE3Ny45MzEgMTAuNTAzIDQuMDg0IDMwLjE4NyAxNC43NjggNDUuNTM3YTkuOTg4IDkuOTg4IDAgMCAwIDguMjE2IDQuMjg4IDkuOTU4IDkuOTU4IDAgMCAwIDUuNzA0LTEuNzkzYzQuNTMzLTMuMTU1IDUuNjUtOS4zODggMi40OTUtMTMuOTIxLTYuNzk4LTkuNzY3LTkuNjAyLTIyLjYwOC0xMC43Ni0zMS40aDgyLjY4NWMuMjcyLjQxNC41NDUuODE4LjgxNSAxLjIxIDMuMTQyIDQuNTQxIDkuMzcyIDUuNjc5IDEzLjkxMyAyLjUzNCA0LjU0Mi0zLjE0MiA1LjY3Ny05LjM3MSAyLjUzNS0xMy45MTMtMTEuOTE5LTE3LjIyOS04Ljc4Ny0zNS44ODQgOS41ODEtNTcuMDEyIDMuMDY3LTIuNjUyIDEyLjMwNy0xMS43MzIgMTEuMjE3LTI0LjAzMy0uODI4LTkuMzQzLTcuMTA5LTE3LjE5NC0xOC42NjktMjMuMzM3YTkuODU3IDkuODU3IDAgMCAwLTEuMDYxLS40ODZjLS40NjYtLjE4Mi0xMS40MDMtNC41NzktOS43NDEtMTUuNzA2IDEuMDA3LTYuNzM3IDE0Ljc2OC04LjI3MyAyMy43NjYtNy42NjYgMjMuMTU2IDEuNTY5IDM5LjY5OCA3LjgwMyA0Ny44MzYgMTguMDI2IDUuNzUyIDcuMjI1IDcuNjA3IDE2LjYyMyA1LjY3MyAyOC43MzMtLjQxMyAyLjU4NS0uODI0IDUuMjQxLTEuMjQ1IDcuOTU5LTUuNzU2IDM3LjE5NC0xMi45MTkgODMuNDgzLTQ5Ljg3IDExNC42NjEtNC4yMjEgMy41NjEtNC43NTYgOS44Ny0xLjE5NCAxNC4wOTJhOS45OCA5Ljk4IDAgMCAwIDcuNjQ4IDMuNTUxIDkuOTU1IDkuOTU1IDAgMCAwIDYuNDQ0LTIuMzU4YzQyLjY3Mi0zNi4wMDUgNTAuODAyLTg4LjUzMyA1Ni43MzctMTI2Ljg4OC40MTUtMi42ODQuODIxLTUuMzA5IDEuMjI5LTcuODYzIDIuODM0LTE3LjcyMS0uNDU1LTMyLjY0MS05Ljc3Mi00NC4zNDV6bS0yMzIuMzA4IDQyLjYyYy01LjUxNCAwLTEwLTQuNDg2LTEwLTEwdi0xLjMzM2MwLTUuNTE0IDQuNDg2LTEwIDEwLTEwaDE1djIxLjMzM2gtMTV6bS0yLjUtNTIuNjY2YzAtNS41MTQgNC40ODYtMTAgMTAtMTBoNy41djIxLjMzM2gtNy41Yy01LjUxNCAwLTEwLTQuNDg2LTEwLTEwdi0xLjMzM3ptMTcuNSA5My45OTloLTcuNWMtNS41MTQgMC0xMC00LjQ4Ni0xMC0xMHYtMS4zMzNjMC01LjUxNCA0LjQ4Ni0xMCAxMC0xMGg3LjV2MjEuMzMzem0zMC43OTYgMjguODg3Yy01LjUxNCAwLTEwLTQuNDg2LTEwLTEwdi04LjI3MWg5MS40NTdjLS44NTEgNi42NjgtLjQzNyAxMi43ODcuNzMxIDE4LjI3MWgtODIuMTg4em03OS40ODItMTEzLjY5OGMtMy4xMjQgMjAuOTA2IDEyLjQyNyAzMy4xODQgMjEuNjI1IDM3LjA0IDUuNDQxIDIuOTY4IDcuNTUxIDUuNjQ3IDcuNzAxIDcuMTg4LjIxIDIuMTUtMi41NTMgNS42ODQtNC40NzcgNy4yNTEtLjQ4Mi4zNzgtLjkyOS44LTEuMzM1IDEuMjYxLTYuOTg3IDcuOTM2LTExLjk4MiAxNS41Mi0xNS40MzIgMjIuNjg4aC05Ny41NjRWMzBjMC01LjUxNCA0LjQ4Ni0xMCAxMC0xMGgxMjMuNzY5YzUuNTE0IDAgMTAgNC40ODYgMTAgMTB2MTM1LjU3OWMtMy4wMzItLjM4MS02LjE1LS42OTQtOS4zODktLjkxNC0yNS4xNTktMS42OTQtNDIuMzcgNy43NDgtNDQuODk4IDI0LjY2NnoiLz48cGF0aCBkPSJNMTc5LjEyOSA4My4xNjdoLTI0LjA2YTUgNSAwIDAgMC01IDV2MjQuMDYxYTUgNSAwIDAgMCA1IDVoMjQuMDZhNSA1IDAgMCAwIDUtNVY4OC4xNjdhNSA1IDAgMCAwLTUtNXpNMTcyLjYyOSAxNDIuODZoLTEyLjU2VjEzMC44YTUgNSAwIDEgMC0xMCAwdjE3LjA2MWE1IDUgMCAwIDAgNSA1aDE3LjU2YTUgNSAwIDEgMCAwLTEwLjAwMXpNMjE2LjU2OCA4My4xNjdoLTI0LjA2YTUgNSAwIDAgMC01IDV2MjQuMDYxYTUgNSAwIDAgMCA1IDVoMjQuMDZhNSA1IDAgMCAwIDUtNVY4OC4xNjdhNSA1IDAgMCAwLTUtNXptLTUgMjQuMDYxaC0xNC4wNlY5My4xNjdoMTQuMDZ2MTQuMDYxek0yMTEuNjY5IDEyNS45MzZIMTk3LjQxYTUgNSAwIDAgMC01IDV2MTQuMjU3YTUgNSAwIDAgMCA1IDVoMTQuMjU5YTUgNSAwIDAgMCA1LTV2LTE0LjI1N2E1IDUgMCAwIDAtNS01eiIvPjwvc3ZnPg==";

export const ASSET_FILE_SCAN: string = SVG_XML_PREFIX + "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1OS4wMTggNTkuMDE4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OS4wMTggNTkuMDE4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48cGF0aCBkPSJtNTguNzQxIDU0LjgwOS01Ljk2OS02LjI0NGExMC43NCAxMC43NCAwIDAgMCAyLjgyLTcuMjVjMC01Ljk1My00Ljg0My0xMC43OTYtMTAuNzk2LTEwLjc5NlMzNCAzNS4zNjEgMzQgNDEuMzE0IDM4Ljg0MyA1Mi4xMSA0NC43OTYgNTIuMTFjMi40NDEgMCA0LjY4OC0uODI0IDYuNDk5LTIuMTk2bDYuMDAxIDYuMjc3YS45OTguOTk4IDAgMCAwIDEuNDE0LjAzMiAxIDEgMCAwIDAgLjAzMS0xLjQxNHpNMzYgNDEuMzE0YzAtNC44NSAzLjk0Ni04Ljc5NiA4Ljc5Ni04Ljc5NnM4Ljc5NiAzLjk0NiA4Ljc5NiA4Ljc5Ni0zLjk0NiA4Ljc5Ni04Ljc5NiA4Ljc5NlMzNiA0Ni4xNjQgMzYgNDEuMzE0ek0xMC40MzEgMTYuMDg4YzAgMy4wNyAyLjQ5OCA1LjU2OCA1LjU2OSA1LjU2OHM1LjU2OS0yLjQ5OCA1LjU2OS01LjU2OGMwLTMuMDcxLTIuNDk4LTUuNTY5LTUuNTY5LTUuNTY5cy01LjU2OSAyLjQ5OC01LjU2OSA1LjU2OXptOS4xMzggMGMwIDEuOTY4LTEuNjAyIDMuNTY4LTMuNTY5IDMuNTY4cy0zLjU2OS0xLjYwMS0zLjU2OS0zLjU2OCAxLjYwMi0zLjU2OSAzLjU2OS0zLjU2OSAzLjU2OSAxLjYwMSAzLjU2OSAzLjU2OXoiLz48cGF0aCBkPSJtMzAuODgyIDI4Ljk4NyA5LjE4LTEwLjA1NCAxMS4yNjIgMTAuMzIzYTEgMSAwIDAgMCAxLjM1MS0xLjQ3NWwtMTItMTFhMSAxIDAgMCAwLTEuNDE0LjA2M2wtOS43OTQgMTAuNzI3LTQuNzQzLTQuNzQzYTEuMDAzIDEuMDAzIDAgMCAwLTEuMzY4LS4wNDRMNi4zMzkgMzcuNzY4YTEgMSAwIDEgMCAxLjMyMiAxLjUwMWwxNi4zMTMtMTQuMzYyIDcuMzE5IDcuMzE4YS45OTkuOTk5IDAgMSAwIDEuNDE0LTEuNDE0bC0xLjgyNS0xLjgyNHoiLz48cGF0aCBkPSJNMzAgNDYuNTE4SDJ2LTQyaDU0djI4YTEgMSAwIDEgMCAyIDB2LTI5YTEgMSAwIDAgMC0xLTFIMWExIDEgMCAwIDAtMSAxdjQ0YTEgMSAwIDAgMCAxIDFoMjlhMSAxIDAgMSAwIDAtMnoiLz48L3N2Zz4=";

export const ASSET_INFO_ICON_16PX : string = SVG_XML_PREFIX + "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NjAgNDYwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NjAgNDYwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48cGF0aCBkPSJNMjMwIDBDMTAyLjk3NSAwIDAgMTAyLjk3NSAwIDIzMHMxMDIuOTc1IDIzMCAyMzAgMjMwIDIzMC0xMDIuOTc0IDIzMC0yMzBTMzU3LjAyNSAwIDIzMCAwem0zOC4zMzMgMzc3LjM2YzAgOC42NzYtNy4wMzQgMTUuNzEtMTUuNzEgMTUuNzFoLTQzLjEwMWMtOC42NzYgMC0xNS43MS03LjAzNC0xNS43MS0xNS43MVYyMDIuNDc3YzAtOC42NzYgNy4wMzMtMTUuNzEgMTUuNzEtMTUuNzFoNDMuMTAxYzguNjc2IDAgMTUuNzEgNy4wMzMgMTUuNzEgMTUuNzFWMzc3LjM2ek0yMzAgMTU3Yy0yMS41MzkgMC0zOS0xNy40NjEtMzktMzlzMTcuNDYxLTM5IDM5LTM5IDM5IDE3LjQ2MSAzOSAzOS0xNy40NjEgMzktMzkgMzl6Ii8+PC9zdmc+";

export const ASSET_CLOSE_ICON_16PX = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAQgAAAEIBarqQRAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE1SURBVDiNfdI7S0NBEAXgLya1otFgpbYSbISAgpXYi6CmiH9KCAiChaVga6OiWPgfRDQ+0itaGVNosXtluWwcuMzePfM4M3sq8lbHBubwg1dc4m1E/J/N4ghDPOIsfk/4xiEao5KX0McFljN4C9d4QTPXuY99jP3DsIoDPGM6BY5i5yI5R7O4q+ImFkJY2DCh3cAH2klyB+9J1xUMMAG7eCh1a+Mr+k48b5diXrFVwwLuS+BJ9MfR7+G0FHOHhTHhnXNWS87VDF4pcnfQK4Ep7XScNLmPTZgURNKKYENYWDpzW1BhscS1WHS8CDgURFJQrWcoF3c13KKbgg1BYQfy8xZWEzTTw1QZbAoKu8FqJnktdu5hcVSHmchiILzzuaDQvjBzV2m8yohCE1jHfPx/xhU+y4G/D75ELlRJsSYAAAAASUVORK5CYII=";
