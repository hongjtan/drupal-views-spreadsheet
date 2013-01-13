/*!
 * @brief 		Allows the user to select table cells in a Drupal view and sums or subtracts the values in the selected cells.
 * @author		Hong Jie Tan <hongjtan@gmail.com>
 * @version		0.2
 * @date		January 2013
 *
 * @section     LICENSE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

jQuery(document).ready(function ($) {
	var selected_op = "+";				// Holds the currently selected operation, add or subtract.
	var selected_list = new Array();	// List of currently selected cells, objects with "cell" and "op" properties.
	var sum = 0;						// Contains the final sum of the values selected.				

	/* Build the user interface and settings. */
	/* Get cookie data from the document. */
	var cookies = document.cookie;		// Grab the document's cookies.
	
	/* Get cookies. */
	background_color = get_cookie("views-spreadsheet-bg-color") ? get_cookie("views-spreadsheet-bg-color") : "#FFFFFF";
	font_color = get_cookie("views-spreadsheet-font-color") ? get_cookie("views-spreadsheet-font-color") : "#000000";
	enable_ctrl = get_cookie("views-spreadsheet-en-ctrl") === "true" ? true : false;

	$("#page #content .view").append("<div id='views-spreadsheet-sum-container'></div>");
	var views_spreadsheet_sum_container = $("#views-spreadsheet-sum-container");

	views_spreadsheet_sum_container.css({
		"display"        :     "block",
		"position"       :     "fixed",
		"background"     :     background_color,
		"width"          :     "200px",
		"height"         :     "90px",
		"right"          :     "100px",
		"bottom"         :     "15px",
		"border-radius"  :     "6px",
		"border"         :     "3px solid green",
		"color"          :     font_color,
		"visibility"     :     "hidden",
		"opacity"        :     "0",
	});

	/*views_spreadsheet_sum_container.hover(function () {
		$(this).fadeTo(300, 0.3);
	}, function () {
		$(this).fadeTo(300, 1.0);
	});*/

	views_spreadsheet_sum_container.append("<p id='views-spreadsheet-number-selected'>Cells Selected: " + selected_list.length + "</p>"
		).append("<p id='views-spreadsheet-sum'> Total Sum: " + sum.toFixed(2) + "</p>");


	$("#views-spreadsheet-sum-container p").css({
		"line-height"   :     "11px",
		"text-align"    :     "center",
		"font-size"     :     "15px",
		"font-weight"   :     "bold",
		"text-shadow"   :     "1px 1px #888",
		"font-family"   :     "Helvetica",
	});

	views_spreadsheet_sum_container.append("<div class='views-spreadsheet-button' id='views-spreadsheet-add-op'>+</div>"
		).append("<div class='views-spreadsheet-button' id='views-spreadsheet-subtract-op'>-</div>"
		).append("<div class='views-spreadsheet-button' id='views-spreadsheet-clear-button')>C</div>"
		).append("<div class='views-spreadsheet-button' id='views-spreadsheet-settings-button'>S</div>"
		);

	$(".views-spreadsheet-button").css({
		"display"          :     "inline-block",
		"font-size"        :     "14px",
		"cursor"           :     "pointer",
		"margin-right"     :     "5px",
		"margin-left"      :     "5px",
		"font-weight"      :     "bold",
	});

	// Change operators when addition or subtraction is chosen.
	$("#views-spreadsheet-add-op").click(function (event) {
		selected_op = "+";

		views_spreadsheet_sum_container.css({
			"border-color"         :     "green",
			"WebkitTransition"     :     "border-color 0.4s ease-in-out",
		    "MozTransition"        :     "border-color 0.4s ease-in-out",
		    "MsTransition"         :     "border-color 0.4s ease-in-out",
		    "OTransition"          :     "border-color 0.4s ease-in-out",
		    "transition"           :     "border-color 0.4s ease-in-out",
		});
	});
	$("#views-spreadsheet-subtract-op").click(function (event) {
		selected_op = "-";

		views_spreadsheet_sum_container.css({
			"border-color"         :     "orange",
			"WebkitTransition"     :     "border-color 0.4s ease-in-out",
		    "MozTransition"        :     "border-color 0.4s ease-in-out",
		    "MsTransition"         :     "border-color 0.4s ease-in-out",
		    "OTransition"          :     "border-color 0.4s ease-in-out",
		    "transition"           :     "border-color 0.4s ease-in-out",
		});
	});

	$("#views-spreadsheet-clear-button").css({
		"float"		:     "right",
	});

	$("#views-spreadsheet-settings-button").css({
		"top"		   :     "0px", 
		"right"        :     "0px",
		"position"     :     "absolute",
		"float"        :     "right",
	});

	/* Clear when clicking on the clear button. */
	$("#views-spreadsheet-clear-button").click(function (event) {
		views_spreadsheet_deselect_list(selected_list);

		sum = 0;

		/* Change the sum and cell count values. */
		$("#views-spreadsheet-number-selected").text("Cells Selected: " + selected_list.length);
		$("#views-spreadsheet-sum").text("Total Sum: " + sum.toFixed(2));

		/* Hide the sum container. */
		views_spreadsheet_sum_container.stop(true, true).animate({
			"opacity"     :     "0.0",
		}, 400, function () {
			$(this).css({"visibility" : "hidden"});
		});
	});

	/* Open the settings page when clicking on the settings button. */
	$("#views-spreadsheet-settings-button").click(function (event) {
		if ($("#views-spreadsheet-settings-container").length === 0) {
			$("#page #content .view").append("<div id='views-spreadsheet-settings-container'></div>");
			$("#views-spreadsheet-settings-container").append("<div id='views-spreadsheet-settings-header'></div>");
			$("#views-spreadsheet-settings-container").append("<div id='views-spreadsheet-settings-body'></div>");
			var views_spreadsheet_settings_container = $("#views-spreadsheet-settings-container");
			var views_spreadsheet_settings_header = $("#views-spreadsheet-settings-header");
			var views_spreadsheet_settings_body = $("#views-spreadsheet-settings-body");

			views_spreadsheet_settings_container.css({
				"display"        :     "block",
				"position"       :     "fixed",
				"background"     :     "white",
				"width"          :     "500px",
				"height"         :     "170px",
				"top"            :     "0",
				"left"           :     "0",
				"right"          :     "0",
				"bottom"         :     "0",
				"margin"         :     "auto auto",
				//"border-radius"  :     "6px",
				"border"         :     "1px solid black",
				"color"     :     "black",
				"opacity"        :     "0",
			});

			views_spreadsheet_settings_container.stop(true, true).animate({ opacity: 1 }, 400);

			/* Style the settings header. */
			views_spreadsheet_settings_header.css({
				"height"               :     "27px",
				"border-bottom"        :     "1px solid black",
				/*"background-image"     :     "linear-gradient(bottom, rgb(140,140,140) 11%, rgb(232,232,232) 50%, rgb(140,140,140) 89%)",
				"background-image"     :     "-o-linear-gradient(bottom, rgb(140,140,140) 11%, rgb(232,232,232) 50%, rgb(140,140,140) 89%)",
				"background-image"     :     "-moz-linear-gradient(bottom, rgb(140,140,140) 11%, rgb(232,232,232) 50%, rgb(140,140,140) 89%)",
				"background-image"     :     "-webkit-linear-gradient(bottom, rgb(140,140,140) 11%, rgb(232,232,232) 50%, rgb(140,140,140) 89%)",
				"background-image"     :     "-ms-linear-gradient(bottom, rgb(140,140,140) 11%, rgb(232,232,232) 50%, rgb(140,140,140) 89%)",
				"background-image"     :     "-webkit-gradient(linear, left bottom, left top, color-stop(0.11, rgb(140,140,140)), color-stop(0.5, rgb(232,232,232)), color-stop(0.89, rgb(140,140,140)))",*/
				"background"		   :     "#1F1F1F",
				"color"				   :     "#FFFFFF",
			});

			/* Append and style the settings header. */
			views_spreadsheet_settings_header.append("<span id='views-spreadsheet-settings-title'>Views Spreadsheet Settings</span>");
			$("#views-spreadsheet-settings-title").css({
				"position"        :     "relative",
				"top"             :     "4px",
				"left"            :     "8px",
				"font-size"       :     "14px",
				"font-weight"     :     "bold",
				"text-shadow"     :     "1px 1px #888",
				"font-family"     :     "Verdana",
			});

			/* Append and style the settings buttons. */
			views_spreadsheet_settings_header.append("<span class='views-spreadsheet-settings-buttons' id='views-spreadsheet-settings-close'>X</span>");
			$(".views-spreadsheet-settings-buttons").css({
				"display"           :     "inline-block",
				"position"          :     "absolute",
				"font-size"         :     "14px",
				"cursor"            :     "pointer",
				"right"             :     "5px",
				"font-weight"       :     "bold",
				"top"               :     "4px",
			});

			/* Style the settings body. */
			views_spreadsheet_settings_body.css({
				"margin"          :     "8px 8px 8px 8px",
				"font-family"     :     "Verdana",
			});

			views_spreadsheet_settings_body.append("<form id='views_spreadsheet_settings_form' name='views_spreadsheet_settings_form' method='get'>"
				).append("<span class='option-text'>Background Color: </span>"
				).append("<input class='option-textbox' type='text' id='views-spreadsheet-bg-color' name='views-spreadsheet-bg-color' value='" + (get_cookie("views-spreadsheet-bg-color") ? get_cookie("views-spreadsheet-bg-color") : "#FFFFFF") + "'>"
				).append("<br/>"
				).append("<span class='option-text'>Font Color: </span>"
				).append("<input class='option-textbox' type='text' id='views-spreadsheet-font-color' name='views-spreadsheet-font-color' value='" + (get_cookie("views-spreadsheet-font-color") ? get_cookie("views-spreadsheet-font-color") : "#000000") + "'>"
				).append("<br/>"
				).append("<br/>"
				).append("<span class='option-text'>Enable CTRL [Beta]:</span>"
				).append("<input class='option-textbox' type='checkbox' id='views-spreadsheet-en-ctrl' name='views-spreadsheet-en-ctrl' " + (get_cookie("views-spreadsheet-en-ctrl") === "true" ? "checked" : "") + ">"
				).append("<br/>"
				).append("<input id='views-spreadsheet-settings-save' type='submit' value='Save Settings'>"
				).append("<br/>"
				).append("</form>"
			);

			var timeout_function = "";	/* Used for holding the timeout function of the save status animation. */

			/* Bind a click function to the save settings button. */
			$("#views-spreadsheet-settings-save").click(function () {
				var selected_bg_color = $("#views-spreadsheet-bg-color").val();
				var selected_font_color = $("#views-spreadsheet-font-color").val();
				var selected_ctrl = $("#views-spreadsheet-en-ctrl").is(":checked");
				var save_status = "";

				var saved = views_spreadsheet_save_settings(selected_bg_color, selected_font_color, selected_ctrl);

				/* Change save status based on return value of save. */
				if (saved === 1) {
					save_status = "Saved successfully."
				}
				else if (saved === -1) {
					save_status = "Invalid HEX value.";
				}

				/* Change value of save status text or create it, if it's not already up. */
				if ($("#views-spreadsheet-save-message").length === 0) {
					views_spreadsheet_settings_body.append("<span id='views-spreadsheet-save-message'>" + save_status + "</span>");
				}
				else {
					$("#views-spreadsheet-save-message").text(save_status);
				}

				/* Clear the timeout function and start performing animations. */
				clearTimeout(timeout_function);
				$("#views-spreadsheet-save-message").css({
					"position"     :     "relative",
					"float"        :     "right",
					"bottom"       :     "43px",
					"right"        :     "25px",
					"color"        :     saved === 1 ? "green" : "red",
					"opacity"	   :     "0",
				}).stop(true, true).animate({ opacity: 1 }, 400, function () {
					timeout_function = setTimeout(function () {
						$("#views-spreadsheet-save-message").stop(true, true).animate({ opacity: 0 }, 400, function () {
							$("#views-spreadsheet-save-message").remove();
						});
					}, 2000);
				})

				views_spreadsheet_sum_container.css({
					"background"           :     get_cookie("views-spreadsheet-bg-color") ? get_cookie("views-spreadsheet-bg-color") : "#FFFFFF",
					"color"				   :     get_cookie("views-spreadsheet-font-color") ? get_cookie("views-spreadsheet-font-color") : "#000000",
					"WebkitTransition"     :     "background 0.4s, color 0.4s ease-in-out",
				    "MozTransition"        :     "background 0.4s, color 0.4s ease-in-out",
				    "MsTransition"         :     "background 0.4s, color 0.4s ease-in-out",
				    "OTransition"          :     "background 0.4s, color 0.4s ease-in-out",
				    "transition"           :     "background 0.4s, color 0.4s ease-in-out",
				}, 400);
			});

			$("#views-spreadsheet-background-option").css({
				"margin-left"     :     "8px",
			});

			$(".option-textbox").css({
				"border"		   :     "1px solid black",
				"float"			   :     "right",
			});

			$("#views-spreadsheet-settings-save").css({
				"position"          :     "relative",
				"display"           :     "block",
				"margin"            :     "0 auto",
				"margin-top"        :     "25px",
				"padding"			:     "3px",
				"cursor"		    :     "pointer",
				"border"            :     "1px solid black",
				"border-radius"     :     "3px",
			});

			/* Close the settings page when clicking on the close button. */
			$("#views-spreadsheet-settings-close").click(function() {
				views_spreadsheet_settings_container.stop(true, true).animate({ opacity: 0 }, 400, function () {
					views_spreadsheet_settings_container.remove();
				});
			});
		}
		else {
			$("#views-spreadsheet-settings-container").stop(true, true).animate({ opacity: 0 }, 400, function () {
				$("#views-spreadsheet-settings-container").remove();
			});
		}
	});
	/* End of building user interface and settings. */

	/* Cell click functions. */
	$(".views-field").click(function (event) {
		var selected_row = $(this).parent().parent().children().index(this.parentNode);
		var selected_column = $(this).parent().children().index(this);
		var row_column = "" + selected_row + " " + selected_column;				// Conversion of row/column values to string format.
		var cell = $(this).text().trim().replace("$", "");
		var cell_value = parseFloat(cell);	// Convert cell value to numeric value, if it is numeric.
		var selected_cell = views_spreadsheet_get_cell(selected_row, selected_column, $(".views-table"));

		// Enter if value is numeric, if not already in the selected list, and if the cell value is not null.
		if (is_numeric(cell) && cell != "") {
			// Shift key modifier for multiple cell selection.
			if (event.shiftKey) {
				if (!jQuery.isEmptyObject(selected_list)) {
					var table = $(".views-table")[0];
					var first_cell = $(selected_list[0].cell);
					var first_row = first_cell.parent().parent().children().index(first_cell[0].parentNode);
					var first_column = first_cell.parent().children().index(first_cell[0]);

					var previous_cell = $(selected_list[selected_list.length - 1].cell);
					var previous_row = previous_cell.parent().parent().children().index(previous_cell[0].parentNode);
					var previous_column = previous_cell.parent().children().index(previous_cell[0]);

					selected_list = views_spreadsheet_deselect_list (selected_list);
					sum = 0;

					/* Clear text selection. */
					deselect_text();

					/* If selection is the same. */
					if (first_row === selected_row && first_column === selected_column) {
						if (views_spreadsheet_select_cell (first_cell, selected_list, selected_op)) {
							sum = views_spreadsheet_operation(selected_op, next_cell_value, sum);
						}
					}
					/* Traverse direction depending on the first and currently selected cells. */
					else if (first_row != selected_row || first_column != selected_column) {
						if (first_column < selected_column) {
							if (first_row < selected_row) {
								for (i = first_column; i <= selected_column; i++) {
									for (j = first_row; j <= selected_row; j++) {
										var next_cell = table.rows[j + 1].cells[i];
										var next_cell_value = parseFloat($(next_cell).text().trim().replace("$", ""))

										if (views_spreadsheet_select_cell (next_cell, selected_list, selected_op)) {
											sum = views_spreadsheet_operation(selected_op, next_cell_value, sum);
										}
									} /* End row traversal. */
								} /* End column traversal. */
							}
							else {
								for (i = first_column; i <= selected_column; i++) {
									for (j = first_row; j >= selected_row; j--) {
										var next_cell = table.rows[j + 1].cells[i];
										var next_cell_value = parseFloat($(next_cell).text().trim().replace("$", ""))

										if (views_spreadsheet_select_cell (next_cell, selected_list, selected_op)) {
											sum = views_spreadsheet_operation(selected_op, next_cell_value, sum);
										}
									} /* End row traversal. */
								} /* End column traversal. */
							}
						}
						else {
							if (first_row < selected_row) {
								for (i = first_column; i >= selected_column; i--) {
									for (j = first_row; j <= selected_row; j++) {
										var next_cell = table.rows[j + 1].cells[i];
										var next_cell_value = parseFloat($(next_cell).text().trim().replace("$", ""))

										if (views_spreadsheet_select_cell (next_cell, selected_list, selected_op)) {
											sum = views_spreadsheet_operation(selected_op, next_cell_value, sum);
										}
									} /* End row traversal. */
								} /* End column traversal. */
							}
							else {
								for (i = first_column; i >= selected_column; i--) {
									for (j = first_row; j >= selected_row; j--) {
										var next_cell = table.rows[j + 1].cells[i];
										var next_cell_value = parseFloat($(next_cell).text().trim().replace("$", ""))

										if (views_spreadsheet_select_cell (next_cell, selected_list, selected_op)) {
											sum = views_spreadsheet_operation(selected_op, next_cell_value, sum);
										}
									} /* End row traversal. */
								} /* End column traversal. */
							}
						}
					}
				}
			} /* End shift key event. */
			/* CTRL key modifier selects one extra cell. */
			else if (event.ctrlKey && !views_spreadsheet_cell_exists(selected_cell, selected_list) && (get_cookie("views-spreadsheet-en-ctrl") === "true" ? true : false)) {
				if (views_spreadsheet_select_cell (selected_cell, selected_list, selected_op)) {
					sum = views_spreadsheet_operation(selected_op, cell_value, sum);
				}
			}
			else if (event.ctrlKey && views_spreadsheet_cell_exists(selected_cell, selected_list) && (get_cookie("views-spreadsheet-en-ctrl") === "true" ? true : false)) {
				var cell_index = views_spreadsheet_cell_index(selected_cell, selected_list);
				var cell_op = selected_list[cell_index].op;

				if (views_spreadsheet_deselect_cell (selected_cell, selected_list) != -1) {
					sum = views_spreadsheet_operation(reverse_op(cell_op), cell_value, sum);
				}
			}
			/* Select one at a time, deselecting all others if no modifier keys are pressed. */
			else {
					selected_list = views_spreadsheet_deselect_list(selected_list);

					if (views_spreadsheet_select_cell (selected_cell, selected_list, selected_op)) {
						sum = views_spreadsheet_operation(selected_op, cell_value, 0)
					}
			}
		}
		/* Deselect all other cells and select clicked cell even if it already is in the list of selected cells. */
		else if (is_numeric(cell) && views_spreadsheet_cell_exists(selected_cell, selected_list) && cell != "") {
			selected_list = views_spreadsheet_deselect_list(selected_list);
			selected_list.push({"cell":selected_cell, "op":selected_op});
			sum = views_spreadsheet_operation(selected_op, cell_value, 0);

			views_spreadsheet_highlight($(selected_cell), selected_op);
			$(selected_cell).addClass("views-spreadsheet-selected-cell");
		}

		/* Hide or show the sum container based on how many values are selected. */
		if (selected_list.length === 0) {
			views_spreadsheet_sum_container.stop(true, true).animate({
				"opacity"     :     "0.0",
			}, 400, function () {
				$(this).css({"visibility" : "hidden"});
			});
		}
		else {
			views_spreadsheet_sum_container.css({
				"visibility"  :     "visible",
			}).stop(true, true).animate({
				"opacity"     :     "1.0",
			}, 400);
		}

		/* Change the sum and cell count values. */
		$("#views-spreadsheet-number-selected").text("Cells Selected: " + selected_list.length);
		$("#views-spreadsheet-sum").text("Total Sum: " + sum.toFixed(2));
	}); /* End of cell click functions. */

	/**
	 * Deselects user selected text in the browser window.
	 */
	function deselect_text () {
		if (window.getSelection) {
			if (window.getSelection().empty) {
				window.getSelection().empty();
			} 
			else if (window.getSelection().removeAllRanges) {
				window.getSelection().removeAllRanges();
			}
		}
		else if (document.selection) {
			document.selection.empty();
		}
	}

	/**
	 * Returns the reverse of the operation passed in.
	 * @param op
	 *   A string containing "+" or "-".
	 * @return {string}
	 *   A string containing the reverse of "+" or "-".
	 */
	function reverse_op (op) {
		switch (op) {
			case "+":
				return "-";
				break;
			case "-":
				return "+";
				break;
			default:
				return false;
				break;
		}
	}

	/**
	 * Checks whether or not a cell is a valid cell to be selected.
	 * @param cell
	 *   A string containing an HTML/JavaScript TD DOM element.
	 * @param array
	 *   An array containing objects with array.cell and array.op strings.
	 */
	function is_valid_cell (cell, array) {
		var cell_data = $(cell).text().trim().replace("$", "");

		if (is_numeric(cell_data) && !views_spreadsheet_cell_exists(cell, array) && cell_data != "") {
			return true;
		}
		else {
			return false;
		}
	}

    /**
     * Highlights a cell based on the operation given.
     * @param cell
     *   A string containing an HTML/JavaScript TD DOM element.
     * @param op
     *   A string containing the cell's add or subtract operation.
     */
	function views_spreadsheet_highlight (cell, op) {
		if (op === "+") {
			cell.css({
				"-webkit-box-shadow"     :     "inset 0px 0px 0px 3px green",
				"-moz-box-shadow"        :     "inset 0px 0px 0px 3px green",
				"box-shadow"             :     "inset 0px 0px 0px 3px green",
			});
		}
		else {
			cell.css({
				"-webkit-box-shadow"     :     "inset 0px 0px 0px 3px orange",
				"-moz-box-shadow"        :     "inset 0px 0px 0px 3px orange",
				"box-shadow"             :     "inset 0px 0px 0px 3px orange",
			});
		}
	}

    /**
     * Check if a given table cell exists in a given array.
     * @param cell
     *   A string containing an HTML/JavaScript TD DOM element.
     * @param array
     *   An array containing objects with array.cell and array.op strings.
     * @return {Boolean}
     *   False if not in array, true if it was found.
     */
	function views_spreadsheet_cell_exists (cell, array) {
		var found_in_array = jQuery.grep(array, function(array_element, i) {
			return array_element.cell == cell;
		});

		if (found_in_array.length === 0) {
			return false;
		}
		else {
			return true;
		}
	}

    /**
     * Finds the index of a given cell in a given array.
     * @param cell
     *   A string containing an HTML/JavaScript TD DOM element.
     * @param array
     *   An array containing objects with array.cell and array.op strings.
     * @return {Number}
     *   Returns the position of the cell in the array.
     */
	function views_spreadsheet_cell_index (cell, array) {
		var cell_index = -1;

		jQuery.grep(array, function(array_element, index) {
			if (array_element.cell === cell) {
				cell_index = index;
				return true;
			}
		});

		return cell_index;
	}

    /**
     * Performs an add or subtract operation depending on the given operation.
     * @param op
     *   A string containing "+" or "-" to be performed.
     * @param value
     *   The value to add or subtract.
     * @param sum
     *   The current sum.
     * @return {*}
     *   The new sum.
     */
	function views_spreadsheet_operation (op, value, sum) {
		switch (op) {
			case "+":
				sum += value;
				break;
			case "-":
				sum -= value;
				break;
			default:
				break;
		}

		return sum;
	}

    /**
     * Removes the inset border on a given cell.
     * @param cell
     *   The cell to have its border removed.
     */
	function views_spreadsheet_remove_highlight (cell) {
		cell.css({
			"-webkit-box-shadow"     :     "none",
			"-moz-box-shadow"        :     "none",
			"box-shadow"             :     "none",
		});
	}

    /**
     * Retrieves the HTML/JavaScript DOM TD element.
     * @param row
     *   The row the cell is in.
     * @param column
     *   The column the cell is in.
     * @param table
     *   The jQuery table to retrieve the cell from.
     * @return {*}
     *   The HTML/Javascript DOM TD element.
     */
	function views_spreadsheet_get_cell (row, column, table) {
		var cell = table.find("tbody")[0].rows[row].cells[column];

		return cell;
	}

    /**
     * Pushes the cell and op into the given array, highlights the cell, and gives it a class.
     * @param cell
     *   The HTML/Javascript DOM TD element to be selected.
     * @param array
     *   An array containing objects with array.cell and array.op strings.
     * @param op
     *   The operation to be performed on the element ("+" or "-").
     * @return {Boolean}
     *   True on success, false on failure.
     */
	function views_spreadsheet_select_cell (cell, array, op) {
		if(is_valid_cell(cell, array)) {
			array.push({"cell":cell, "op":op});

			views_spreadsheet_highlight($(cell), op);
			$(cell).addClass("views-spreadsheet-selected-cell");

			return true;
		}
		else {
			return false;
		}
	}

    /**
     * Removes the cell from a given array along with its highlight and the added class.
     * @param cell
     *   The HTML/Javascript DOM TD element to be de-selected.
     * @param array
     *   An array containing objects with array.cell and array.op strings.
     * @return {*}
     *   True if successful, false if failed.
     */
	function views_spreadsheet_deselect_cell (cell, array) {
		var deselect_index = -1;
		var exists = jQuery.grep(array, function(array_element, index) {
			if (array_element.cell === cell) {
				deselect_index = index;
				return true;
			}
		});

		if (exists.length === 0) {
			return false;
		}
		else {
			views_spreadsheet_remove_highlight($(cell));
			$(cell).removeClass("views-spreadsheet-selected-cell");

			array.splice(deselect_index, 1);

			return true;
		}
	}

    /**
     * Given an array of array.cell and array.op objects, deselects them.
     * @param array
     *   An array containing objects with array.cell and array.op strings.
     * @return {*}
     *   Returns the empty array.
     */
	function views_spreadsheet_deselect_list (array) {
		for (i = 0; i < array.length; i++) {
			$(array[i].cell).removeClass("views-spreadsheet-selected-cell");
			views_spreadsheet_remove_highlight($(array[i].cell));
		}

		array.length = 0;

		return array;
	}
});

/**
 * Checks if a value is numeric.
 * @param value
 *   The value to be checked.
 * @return {Boolean}
 *   True if numeric, false if not numeric.
 */
function is_numeric(value) {
	return !isNaN(value);
}

/**
 * Checks if a value is a valid HEX color.
 * @param value
 *   The value to be checked.
 * @return {Boolean}
 *   True if valid, false if not valid.
 */
function is_valid_color(value) {
	var valid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);

	return valid;
}

/**
 * Save settings.
 * @param background_color
 *   A background color in HEX format.
 * @param font_color
 *   A font color in HEX format.
 * @param enable_ctrl
 *   True or false whether or not the CTRL modifier key is enabled.
 * @return {Number}
 *   1 if successful, returns an error code otherwise.
 */
function views_spreadsheet_save_settings (background_color, font_color, enable_ctrl) {
	if (!is_valid_color(background_color) || !is_valid_color(font_color)) {
		return -1;
	}
	else {
		document.cookie = "views-spreadsheet-bg-color=" + background_color;
		document.cookie = "views-spreadsheet-font-color=" + font_color;
		document.cookie = "views-spreadsheet-en-ctrl=" + enable_ctrl;

		return 1;
	}
}

/**
 * Gets a cookie based on a given key.
 * @param key
 *   The key to look for.
 * @return {*}
 *   The value of the cookie.
 */
function get_cookie(key) {
  	var cookies = document.cookie.split("; ");
  	var key_value = new Array();

  	for (i = 0; i < cookies.length; i++) {
  		key_value = cookies[i].split("=");

  		if (key_value[0] === key) {
  			return unescape(key_value[1]);
  		}
  	}
}

/**
 * Deletes a cookie based on a given key.
 * @param key
 *   The key to look for.
 */
function delete_cookie(key) {
	document.cookie = key + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}