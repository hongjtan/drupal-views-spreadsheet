// This code allows the user to select numbers in a view and the code will sum it and display it back to the user.
jQuery(document).ready(function ($) {
	var selected_op = "+";				// Holds the currently selected operation, add or subtract.
	var selected_list = new Array();	// List of currently selected cells, objects with "cell" and "op" properties.
	var operator_list = new Array();	// Individual operations for each cell.
	var sum = 0;						// Contains the final sum of the values selected.
	//var selected = new Array();		// Contains the list of selected values in "row column" format.

	var selected = [];

	$("#page #content .view").append("<div id='views-spreadsheet-sum-container'></div>");
	var views_spreadsheet_sum_container = $("#views-spreadsheet-sum-container");

	views_spreadsheet_sum_container.css({
		"display"        :     "block",
		"position"       :     "fixed",
		"background"     :     "white",
		"width"          :     "200px",
		"height"         :     "90px",
		"right"          :     "100px",
		"bottom"         :     "15px",
		"border-radius"  :     "6px",
		"border"         :     "3px solid green",
		"font-color"     :     "black",
		/*"visibility"     :     "hidden",
		"opacity"        :     "0",*/
	});

	views_spreadsheet_sum_container.hover(function () {
		$(this).fadeTo(300, 0.3);
	}, function () {
		$(this).fadeTo(300, 1.0);
	});

	views_spreadsheet_sum_container.append("<p id='views-spreadsheet-number-selected'>Cells Selected: " + selected.length + "</p>");
	views_spreadsheet_sum_container.append("<p id='views-spreadsheet-sum'> Total Sum: " + sum.toFixed(2) + "</p>");


	$("#views-spreadsheet-sum-container p").css({
		"line-height"   :     "11px",
		"text-align"    :     "center",
		"font-size"     :     "15px",
		"font-weight"   :     "bold",
		"text-shadow"   :     "1px 1px #888",
		"font-family"   :     "Helvetica",
	});

	views_spreadsheet_sum_container.append("<div class='views-spreadsheet-button' id='views-spreadsheet-add-op'>+</div>");
	views_spreadsheet_sum_container.append("<div class='views-spreadsheet-button' id='views-spreadsheet-subtract-op'>-</div>");
	views_spreadsheet_sum_container.append("<div class='views-spreadsheet-button' id='views-spreadsheet-settings-button'>S</div>");

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

	$("#views-spreadsheet-settings-button").css({
		"float"     :     "right",
	});

	/* Open the settings page when clicking on the settings button. */
	$("#views-spreadsheet-settings-button").click(function (event) {
		if ($("#views-spreadsheet-settings-container").length === 0) {
			$("#page #content .view").append("<div id='views-spreadsheet-settings-container'></div>");
			var views_spreadsheet_settings_container = $("#views-spreadsheet-settings-container");
			views_spreadsheet_settings_container.css({
				"display"        :     "block",
				"position"       :     "fixed",
				"background"     :     "white",
				"width"          :     "500px",
				"height"         :     "400px",
				"top"            :     "0",
				"left"           :     "0",
				"right"          :     "0",
				"bottom"         :     "0",
				"margin"         :     "auto auto",
				"border-radius"  :     "6px",
				"border"         :     "1px solid black",
				"font-color"     :     "black",
				"opacity"        :     "0",
			});

			views_spreadsheet_settings_container.animate({ opacity: 1 }, 400);

			views_spreadsheet_settings_container.append("<span id='views-spreadsheet-settings-title'>Views Spreadsheet Settings</span>");
			$("#views-spreadsheet-settings-title").css({
				"margin-top"      :     "5px",
				"margin-left"     :     "5px",
				"font-size"       :     "16px",
				"font-weight"     :     "bold",
			});

			views_spreadsheet_settings_container.append("<span class='views-spreadsheet-settings-buttons' id='views-spreadsheet-settings-close'>X</span>");
			$(".views-spreadsheet-settings-buttons").css({
				"display"          :     "inline-block",
				"position"         :     "absolute",
				"font-size"        :     "14px",
				"cursor"           :     "pointer",
				"right"            :     "5px",
				"font-weight"      :     "bold",
			});

			/* Close the settings page when clicking on the close button. */
			$("#views-spreadsheet-settings-close").click(function() {
				views_spreadsheet_settings_container.animate({ opacity: 0 }, 400, function () {
					views_spreadsheet_settings_container.remove();
				});
			});
		}
	});

	// Cell click functions.
	$(".views-field").click(function (event) {
		var selected_row = $(this).parent().parent().children().index(this.parentNode);
		var selected_column = $(this).parent().children().index(this);
		var row_column = "" + selected_row + " " + selected_column;				// Conversion of row/column values to string format.
		var cell = $(this).text().trim().replace("$", "")
		var cell_value = parseFloat(cell);	// Convert cell value to numeric value, if it is numeric.
		var selected_cell = views_spreadsheet_select_cell(selected_row, selected_column, $(".views-table"));

		// Look at previous selection, if it exists multiple select based on previous selection.
		/*if (event.shiftKey) {
			if (!jQuery.isEmptyObject(selected)) {
				var previous_row_column = selected[selected.length - 1].split(" ");
				var previous_row = parseInt(previous_row_column[0]);
				var previous_column = parseInt(previous_row_column[1]);

				// If selection is the same.
				if (previous_row === selected_row && previous_column === selected_column) {
					// Do nothing.
				}
				// If both the rows and columns are different.
				else if (previous_row != selected_row && previous_column != selected_column) {
					// Do nothing.
				}
				// If the rows are the same, but the columns are different.
				else if (previous_row === selected_row && previous_column != selected_column) {
					if (previous_column < selected_column) {
						for (i = previous_column + 1; i != selected_column; i++) {
							$(".view .views-table tr:eq("+(selected_row + 1)+") td:eq("+i+")").trigger("click");
						}
					}
					else {
						for (i = previous_column - 1; i != selected_column; i--) {
							$(".view .views-table tr:eq("+(selected_row + 1)+") td:eq("+i+")").trigger("click");
						}
					}
				}
				// If the columns are the same, but the rows are different.
				else if (previous_row != selected_row && previous_column === selected_column) {
					if (previous_row < selected_row) {
						for (i = previous_row + 1; i != selected_row; i++) {
							$(".view .views-table tr:eq("+(i + 1)+") td:eq("+selected_column+")").trigger("click");
						}
					}
					else {
						for (i = previous_row - 1; i != selected_row; i--) {
							$(".view .views-table tr:eq("+(i + 1)+") td:eq("+selected_column+")").trigger("click");
						}
					}
				}
				else {
					// Do nothing.
				}
			}
		}
		else if (event.ctrlKey) {
			views_spreadsheet_deselect_list(selected_list);
		}*/

		// Enter if value is numeric, if not already in the selected list, and if the cell value is not null.
		if (isNumeric(cell) && /*jQuery.inArray(selected_cell, selected_list) === -1*/ !views_spreadsheet_cell_exists(selected_cell, selected) && cell != "") {
			// Shift key modifier for multiple selection.
			if (event.shiftKey) {

			}
			// CTRL key modifier selects one extra cell.
			else if (event.ctrlKey) {
				selected_list.push(selected_cell);
				selected.push({"cell":selected_cell, "op":selected_op});
				sum = views_spreadsheet_operation(selected_op, cell_value, sum);

				views_spreadsheet_highlight($(selected_cell), selected_op);
			}
			// Select one at a time if no modifier keys are pressed.
			else {
				//selected_list = views_spreadsheet_deselect_list(selected_list);
				//selected_list.push(selected_cell);
				selected = views_spreadsheet_deselect_list(selected);
				selected.push({"cell":selected_cell, "op":selected_op});
				sum = views_spreadsheet_operation(selected_op, cell_value, 0);

				views_spreadsheet_highlight($(selected_cell), selected_op);
			}
		}
		// Deselect if CTRL key is pressed and already selected.
		else if (event.ctrlKey && views_spreadsheet_cell_exists(selected_cell, selected)) {
			var cell_index = views_spreadsheet_cell_index(selected_cell, selected);
			var cell_op = selected[cell_index].op === "+" ? "-" : "+";

			sum = views_spreadsheet_operation(cell_op, cell_value, sum);

			views_spreadsheet_remove_highlight($(selected_cell));

			selected = views_spreadsheet_deselect(selected_cell, selected);
		}

		// Check if the table cell contains a numeric value.
		// Also check to see if the cell value is already selected.
		// Also check if cell value is an empty string.
		/*if(isNumeric(cell_value) && jQuery.inArray(row_column, selected) === -1 && cell_value != "") {
			selected.push(row_column);

			sum += parseFloat(cell_value);
			sum = Math.round(sum * 100) / 100;

			// Show the inner border if a value is selected.
			$(this).css({
				"-webkit-box-shadow"     :     "inset 0px 0px 0px 3px #000",
				"-moz-box-shadow"        :     "inset 0px 0px 0px 3px #000",
				"box-shadow"             :     "inset 0px 0px 0px 3px #000",
			});

			// Show the pop up when there are values.
			views_spreadsheet_sum_container.css({
				"visibility"  :     "visible",
			}).animate({
				"opacity"     :     "1.0",
			}, 400);
		}
		else if (jQuery.inArray(row_column, selected) != -1) {
			selected.splice(jQuery.inArray(row_column, selected), 1);

			sum -= parseFloat(cell_value);
			sum = Math.round(sum * 100) / 100;

			// Remove the inner border if element is selected again.
			$(this).css({
				"-webkit-box-shadow"     :     "none",
				"-moz-box-shadow"        :     "none",
				"box-shadow"             :     "none",
			});

			// Hide the pop up when no values are selected.
			if (selected.length === 0) {
				views_spreadsheet_sum_container.animate({
					"opacity"     :     "0.0",
				}, 400, function () {
					$(this).css({"visibility" : "hidden"});
				});
			}
		}*/

		$("#views-spreadsheet-number-selected").text("Cells Selected: " + selected.length);
		$("#views-spreadsheet-sum").text("Total Sum: " + sum.toFixed(2));
	});

	// Function that checks whether a value is numeric.
	function isNumeric(value) {
		return !isNaN(value);
	}

	// This function takes a cell and highlights it with an inset shadow.
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

	function views_spreadsheet_cell_exists (cell, array) {
		var found_in_array = jQuery.grep(array, function(array_element, i) {
			return array_element.cell === cell;
		});

		if (found_in_array.length === 0) {
			return false;
		}
		else {
			return true;
		}
	}

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

	// This function either adds or subtracts values based on what is selected.
	function views_spreadsheet_operation (operation, value, sum) {
		switch (operation) {
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

	// This function takes a cell and removes the highlight from the cell.
	function views_spreadsheet_remove_highlight (cell) {
		cell.css({
			"-webkit-box-shadow"     :     "none",
			"-moz-box-shadow"        :     "none",
			"box-shadow"             :     "none",
		});
	}

	// Selects a cell given the row, column number, and the table to select from. Returns a JavaScript DOM object.
	function views_spreadsheet_select_cell (row, column, table) {
		var cell = table.find("tbody")[0].rows[row].cells[column];

		return cell;
	}

	function views_spreadsheet_deselect (cell, array) {
		var deselect_index = -1;
		jQuery.grep(array, function(array_element, index) {
			if (array_element.cell === cell) {
				deselect_index = index;
				return true;
			}
		});

		array.splice(deselect_index, 1);

		return array;
	}

	// Given an array of selected items, deselects them.
	function views_spreadsheet_deselect_list (array) {
		for (i = 0; i < array.length; i++) {
			views_spreadsheet_remove_highlight($(array[i].cell));
		}

		array.length = 0;

		return array;
	}
});