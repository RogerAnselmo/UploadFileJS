
var _maxFileNumber = 1;//número máximo de arquivos
var _allowedExtensions = ['JPG', 'PNG', 'JPEG'];//extensões permitidas
var _maxFileSize = 20;//tamanho(em MB) máximo do arquivo
var _filePath = '/Uploads/';
var _urlUpload = '';
var _Anchor = "FileDiv";

function startUploadComponent(_target, pMaxFileNumber, pAllowedExtensions, pMaxFileSize, pUrlUpload, pFilePath, pFunction) {

    _maxFileNumber = (!pMaxFileNumber || pMaxFileNumber === 0) ? _maxFileNumber : pMaxFileNumber;
    _allowedExtensions = (!pAllowedExtensions || pAllowedExtensions === []) ? _allowedExtensions : pAllowedExtensions;
    _maxFileSize = (!pMaxFileSize || pMaxFileSize === 0) ? _maxFileSize : pMaxFileSize;
    _urlUpload = (!pUrlUpload || pUrlUpload === '') ? _urlUpload : pUrlUpload;
    _filePath = (!pFilePath || pFilePath === '') ? _filePath : pFilePath;

    $('#' + _target).html(CreateDivContent(_target));

    OnfileUploadChange(_target, pFunction);
}


//validações
function ValidateExtension(_target) {
    var extension = $("#FileUpload" + _target).val().substr(($("#FileUpload" + _target).val().lastIndexOf('.') + 1)).toUpperCase();

    if (_allowedExtensions.indexOf(extension) == -1) {

        var mensagem = "Extensões prermitidas ";

        for (var i = 0; i < _allowedExtensions.length; i++) {
            mensagem += _allowedExtensions[i] + " | ";
        }

        swal("Atenção!", mensagem, "error");
        return false;
    }

    return true;

}

function ValidateFileSize(_target) {

    var tamanhoArquivo = $("#FileUpload" + _target)[0].files[0].size;//tamanho em bytes do arquivo
    tamanhoArquivo = (tamanhoArquivo / 1024) / 1024;//transformando para MB
    tamanhoArquivo = tamanhoArquivo.toFixed(4);//4 casas decimais


    if (tamanhoArquivo > _maxFileSize) {
        swal("Atenção!", "Favor selecione um arquivo com menos de " + _maxFileSize + "MB!", "error");
        return false;
    }

    return true;
}

function ValidateMaxFileNumber(_target) {

    var totalOfFiles = parseInt($('#TotalFiles' + _target).val());
    var FIleUpload = $("#FileUpload" + _target).get(0);
    var maxFileNumber = $("#MaxFileNumber" + _target).val();


    if (FIleUpload.files.length > maxFileNumber || totalOfFiles >= maxFileNumber) {
        swal("Atenção!", "Máximo de " + maxFileNumber + " arquivo(s) para esta seção", "error");
        return false;
    }
    else {
        $('#lblMensagemQuantidadeArquivosAV').hide();
    }

    return true;
}

function ValidateNameLength(_target) {

    var objRE = new RegExp(/([^\/\\]+)$/);
    var FileName = objRE.exec(document.getElementById('FileUpload' + _target).value);
    if (FileName == null) {
        swal('Atenção', 'deu merda', 'warning');
        return false;
    }

    if (FileName[0].length > 40) {

        swal('Atenção', 'O nome do arquivo deve ter no máximo 40 caracteres', 'warning');

        return false;
    }

    return true;
}

//Eventos
function OnfileUploadChange(_target, _function) {

    if (_function) {
        $('#FileUpload' + _target).change(_function);
        return;
    }

    $('#FileUpload' + _target).change(function () {

        var extension = $("#FileUpload" + _target).val().substr(($("#FileUpload" + _target).val().lastIndexOf('.') + 1)).toUpperCase()

        if (extension === "") {
            $('#FileUpload' + _target).val('');
            return;
        }

        //var position = $(window).scrollTop();

        if (ValidateMaxFileNumber(_target) && ValidateFileSize(_target) && ValidateExtension(_target) && ValidateNameLength(_target)) {

            $.ajax({
                url: $('#UrlUpload' + _target).val(),
                type: "POST",
                contentType: false,
                processData: false,
                data: LoadFileFromFileUpload(_target),
                success: function (result) {

                    var fileIndex = $('#TotalFiles' + _target).val();
                    var filePath = $('#FilePath' + _target).val();

                    //$(window).scrollTop(position);
                    IncrementFileNumber(_target);


                    $('#' + _Anchor + _target).show();

                    var fileName = document.getElementById('FileUpload' + _target).files.item(0).name;
                    var caminhoDoArquivo = window.location.protocol + "//" + window.location.host + filePath + result;
                    var divContent = $('#' + _Anchor + _target).html();
                    var nomeAbreviado = "";

                    if (fileName.length > 20) {
                        var fileExtension = $("#FileUpload" + _target).val().substr(($("#FileUpload" + _target).val().lastIndexOf('.') + 1));

                        nomeAbreviado = fileName.substr(0, 20) + '...' + fileExtension;
                    }
                    else {
                        nomeAbreviado = fileName;
                    }

                    divContent += '<div id="AddedDivFile' + fileIndex + '"><img src="../Content/images/ok.PNG" style="margin: 20px-56px-15px 45px"><span class="sp bg-gray" style="margin: 0px 0px 0px 0px;">' + nomeAbreviado + '</span><input type="button" style="margin:-4px 0px 0px 25px; position:absolute; width: 10px;" class="buttonRemoveUpLoad" onclick="RemoveFile(this)"></input><input style="display:none;" class="nomeArquivo" value="' + result + '{' + fileName + '}' + '"></input></div>';
                    $('#' + _Anchor + _target).html(divContent);
                    $('#FileUpload' + _target).val('');
                },
                error: function (err) {
                    swal("Atenção!", err.statusText, "success");
                }
            });
        }
    });
}

function RemoveFile(button) {

    var Target = $(button).closest("div").parent().attr('id').replace(_Anchor, '');

    DecrementFileNumber(Target);
    $(button).closest("div").remove();

    if (parseInt($('#TotalFiles' + Target).val()) === 0) {
        $('#' + _Anchor + Target).hide();
    }
}


//criando elementos HTML
function CreateDivContent(_target) {
    var divContent = "";

    divContent += CreateFileDiv(_target);
    divContent += CreateUploadButton(_target);
    divContent += CreateInputControls(_target);

    return divContent;
}

function CreateUploadButton(_target) {

    var button = '<div id= "dv' + _target + '"><a class="fileUploadtab btn btn-primary">'
        + '<input id="FileUpload' + _target + '" type= "file" class="upload" value= "Enviar Arquivo"> '
        + '<i class="fa fa-upload" aria-hidden="true"></i>'
        + ' Enviar arquivo'
        + '</a></div>';

    return button;
}

function CreateInputControls(_target) {

    var controlInputs = "";

    controlInputs += '<input type="hidden" id="TotalFiles' + _target + '" value ="0" />';
    controlInputs += '<input type="hidden" id="MaxFileNumber' + _target + '"  value="' + _maxFileNumber + '"/>';
    controlInputs += '<input type="hidden" id="FilePath' + _target + '"  value="' + _filePath + '"/>';
    controlInputs += '<input type="hidden" id="UrlUpload' + _target + '"  value="' + _urlUpload + '"/>';

    return controlInputs;

}

function CreateFileDiv(_target) {
    return '<div id="' + _Anchor + _target + '" class="alertas alertas" style="display: none;"></div>';
}


//auxiliares
function LoadFileFromFileUpload(_target) {

    //pega a extensão do arquivo
    var extensao = $("#FileUpload" + _target).val().substr(($("#FileUpload" + _target).val().lastIndexOf('.') + 1));

    //pega o arquivo que foi selecionado no fileUpload
    var fileUpload = $("#FileUpload" + _target).get(0);
    var files = fileUpload.files;


    //prepara o arquivo para enviar para o servidor
    var fileData = new FormData();
    for (var i = 0; i < files.length; i++) {
        fileData.append(files[i].name, files[i]);
    }
    fileData.append('EXT', extensao);

    return fileData;
}

function IncrementFileNumber(_target) {
    $('#TotalFiles' + _target).val(parseInt($('#TotalFiles' + _target).val()) + 1);
}

function DecrementFileNumber(_target) {
    $('#TotalFiles' + _target).val(parseInt($('#TotalFiles' + _target).val()) - 1);
}