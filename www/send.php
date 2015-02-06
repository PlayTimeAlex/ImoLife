<?php

//debug mode.
define("DEBUG", false);

//Wrap for form messages
$messages_wrap_tag = array(
	"open" => "<p>",
	"close" => "</p>"
);

//sebarator between label end message 
$label_separator = ":";

/*
*	required - сообщение если обязательно поле не заполнено.
*	validation-error - сообщение если поле не прошло валидацию
*	wrong-form" - сообщение если был отправлен не существующий идентефикатор формы
*/
$messages = array(
	"success" => "Ваше сообщение отправлено. Спасибо.",
	"fail" => "Ошибка отправки сообщениея. Попроуйте позже или свяжитесь с администратором.",
	"required" => "Пожалуйста заполните поле %s.",
	"validation-error" => "Ошибка валидации. Пожалуйста проверьте %s поле и отправьте еще раз.",
	"wrong-form" => "Ошибка отправки сообщения.",
	"debug-field-absent" => "Поле %s(%s) не задано в форме."
);

/*
*	@todo для поля number сделать доступными min и max
*	@todo 		"email-template" => <<<EOT EOT
*/
$forms = array(
	"id1" => array(
		"to" => "maximvolkovski@gmail.com",
		"from" => "ImoLive", //пока так. Поле от кого с возможностью ответа
		"subject" => "ImoLive - промо сайт",
		"fields" => array(
			"name"=> array(
				"label" => "Имя",
				"type" => "text",
				"required" => true
			),
			"tel"=> array(
				"label" => "Телефон",
				"type" => "tel",
				"required" => true
			)
		),

	),
);

if($_SERVER['REQUEST_METHOD'] == "POST"){

	if(isset($_POST['formId']) AND array_key_exists($_POST['formId'], $forms)) {
		$form = $forms[$_POST['formId']];
	} else {
		die($messages_wrap_tag['open'].getError('wrong-form').$messages_wrap_tag['close']);
	}

	$sending = true;
	$html = ''; // Html который будет возвращен в ответ
	$email = '';
	
	foreach ($form['fields'] as $key => $data){
		if(isset($_POST[$key])) {
			$text = trim($_POST[$key]);
			
			if($text === "") {
				if(isset($data['required']) AND $data['required']) {
					$html .= $messages_wrap_tag['open'].sprintf(getError('required'), $data['label']).$messages_wrap_tag['close'];
					$sending = false;
				}
			} else {
				if(!isValid($text, $data)) {
					$html .= $messages_wrap_tag['open'].sprintf(getError('validation-error'), $data['label']).$messages_wrap_tag['close'];
					$sending = false;
					continue;
				}
				$email .= "<p>".$data['label'].$label_separator.' '.htmlentities($text, ENT_QUOTES, 'UTF-8')."</p>";
			}		
		} else {
			if(DEBUG)
				$html .= $messages_wrap_tag['open'].sprintf(getError('debug-field-absent'), $data['label'], $key).$messages_wrap_tag['close'];
		}
	}
	
	
	
	if($sending) {
		$message = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>'.$email.'</body></html>';
		if(mail_utf8($form['to'], $form['from'], $form['subject'], $message)){
			echo $messages_wrap_tag['open'].getError('success').$messages_wrap_tag['close'];
		}else{
			echo $messages_wrap_tag['open'].getError('fail').$messages_wrap_tag['close'];
		}
	} else {
		echo $html;
	}
	

} else {
	echo getError('wrong-form');
}

/*
*	Возвращает сообщение об ошибке
*	
*	@param {string} тип сообщение
*	@param {array} текущая форма
*		
*	return {string}	
*/

function getError($message, $form = false) {
	global $messages;

	if($form)
		if(array_key_exists($form['messages'][$message], $form))
			return $form['messages'][$message];

	return $messages[$message];
}

/*
*	Проверка валидности полей
*	
*	@param {string} содержимое поля
*	@param {array} параметры поля
*	
*	return {bool}	
*/

function isValid($field, $field_data = false){
	$field_data ? $type = $field_data['type'] : $type = "text";

	switch ($type) {
		case "email":
			return filter_var($field, FILTER_VALIDATE_EMAIL);
		case "number":
			//реализовать min и max
			return filter_var($field, FILTER_VALIDATE_INT);
		case "tel":
			// ПОКА ПОДДЕРЖКА ТЕЛЕФОНА НЕ РЕАЛИЗОВАНА
			return true;
		default:
			return true;
	}
}

function mail_utf8($to, $from_user, $subject, $message){
	$from_user = "=?UTF-8?B?".base64_encode($from_user)."?=";
	$subject = "=?UTF-8?B?".base64_encode($subject)."?=";

	$headers = "From: $from_user\r\n".
					 "MIME-Version: 1.0" . "\r\n" .
					 "Content-type: text/html; charset=UTF-8" . "\r\n";

	return mail($to, $subject, $message, $headers);
}